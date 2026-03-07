
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestore, useCollection, addDocumentNonBlocking, deleteDocumentNonBlocking, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, serverTimestamp, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search, Calendar, User, Music, Trash2, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { SolistaHymn, UserProfile } from "@/lib/types";
import { useDoc } from "@/firebase";

const hymnFormSchema = z.object({
  title: z.string().min(3, "Título muito curto"),
  lyrics: z.string().min(10, "Letra muito curta"),
});

const profileFormSchema = z.object({
  username: z.string().min(3, "Nome muito curto"),
  conjunto: z.string().min(1, "Selecione um conjunto"),
});

export function SolistaSection() {
  const { user } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [isAddingHymn, setIsAddingHymn] = useState(false);

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);
  
  const { data: profile } = useDoc<UserProfile>(userRef);

  const hymnsColRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "solistaHymns");
  }, [db]);

  const allHymnsQuery = useMemoFirebase(() => {
    if (!hymnsColRef) return null;
    return query(hymnsColRef, orderBy("createdAt", "desc"));
  }, [hymnsColRef]);

  const { data: allHymns, isLoading } = useCollection<SolistaHymn>(allHymnsQuery);

  const hymnForm = useForm<z.infer<typeof hymnFormSchema>>({
    resolver: zodResolver(hymnFormSchema),
    defaultValues: { title: "", lyrics: "" },
  });

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { username: profile?.username || "", conjunto: profile?.conjunto || "" },
  });

  const handleUpdateProfile = (values: z.infer<typeof profileFormSchema>) => {
    if (!userRef) return;
    // Mutação não-bloqueante conforme diretrizes
    updateDocumentNonBlocking(userRef, {
      username: values.username,
      conjunto: values.conjunto,
    });
    toast({ title: "Perfil Atualizado!", description: "Agora você pode adicionar seus hinos." });
  };

  const handleAddHymn = (values: z.infer<typeof hymnFormSchema>) => {
    if (!hymnsColRef || !profile || !user) return;
    
    const newHymn = {
      title: values.title,
      lyrics: values.lyrics,
      solistaId: user.uid,
      solistaName: profile.username || user.email,
      conjunto: profile.conjunto,
      createdAt: serverTimestamp(),
    };

    addDocumentNonBlocking(hymnsColRef, newHymn);
    hymnForm.reset();
    setIsAddingHymn(false);
    toast({ title: "Hino Adicionado!", description: "Seu hino foi publicado com sucesso." });
  };

  const handleRemoveHymn = (id: string) => {
    if (!db) return;
    deleteDocumentNonBlocking(doc(db, "solistaHymns", id));
    toast({ title: "Hino Removido" });
  };

  const filteredHymns = allHymns?.filter(hymn => {
    const matchesSearch = hymn.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (hymn.solistaName && hymn.solistaName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const hymnDate = hymn.createdAt ? format(new Date(hymn.createdAt.seconds * 1000), "yyyy-MM-dd") : "";
    const matchesDate = filterDate === "" || hymnDate === filterDate;
    
    return matchesSearch && matchesDate;
  });

  if (!user) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto size-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Acesso Restrito</h2>
        <p className="text-muted-foreground">Faça login para gerenciar seus hinos como solista.</p>
        <Button className="mt-4" asChild>
          <a href="/login">Entrar agora</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!profile?.conjunto && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>Identifique-se como Solista</CardTitle>
            <CardDescription>Para postar hinos, precisamos saber seu nome e conjunto.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Artístico / Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="conjunto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conjunto</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione seu conjunto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Louvores de Sião">Louvores de Sião</SelectItem>
                            <SelectItem value="Semente da Fé">Semente da Fé</SelectItem>
                            <SelectItem value="Grande Coral">Grande Coral</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit">Confirmar Perfil</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {profile?.conjunto && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Music className="text-primary" /> Meus Hinos e Solistas
            </h2>
            <Button onClick={() => setIsAddingHymn(!isAddingHymn)}>
              <PlusCircle className="mr-2" /> {isAddingHymn ? "Cancelar" : "Novo Hino"}
            </Button>
          </div>

          {isAddingHymn && (
            <Card>
              <CardHeader>
                <CardTitle>Postar Novo Hino</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...hymnForm}>
                  <form onSubmit={hymnForm.handleSubmit(handleAddHymn)} className="space-y-4">
                    <FormField
                      control={hymnForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título do Hino</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Grandioso És Tu" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={hymnForm.control}
                      name="lyrics"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Letra</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Cole a letra do hino aqui..." rows={6} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Publicar Hino</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por nome ou título..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input 
                    type="date" 
                    className="pl-9"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="size-4" />
                  <span>{filteredHymns?.length || 0} hinos encontrados</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            {filteredHymns?.map((hymn) => (
              <Card key={hymn.id} className="group overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{hymn.title}</CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="size-3" /> {hymn.solistaName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" /> {hymn.createdAt ? format(new Date(hymn.createdAt.seconds * 1000), "dd/MM/yyyy", { locale: ptBR }) : "..."}
                          </span>
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                            {hymn.conjunto}
                          </span>
                        </div>
                      </div>
                      {hymn.solistaId === user.uid && (
                        <Button variant="ghost" size="icon" className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveHymn(hymn.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                    <div className="mt-4 text-muted-foreground line-clamp-3 whitespace-pre-wrap text-sm italic">
                      {hymn.lyrics}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {filteredHymns?.length === 0 && !isLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <Music className="mx-auto size-12 mb-4 opacity-20" />
                <p>Nenhum hino encontrado com esses filtros.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
