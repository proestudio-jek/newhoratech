
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
import { PlusCircle, Search, Calendar, User, Music, Trash2, Filter, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { SolistaHymn, UserProfile } from "@/lib/types";
import { useDoc } from "@/firebase";
import Link from "next/link";

const hymnFormSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
  lyrics: z.string().optional(),
});

const profileFormSchema = z.object({
  username: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  conjunto: z.string().min(1, "Selecione o conjunto ao qual você pertence."),
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
    updateDocumentNonBlocking(userRef, {
      username: values.username,
      conjunto: values.conjunto,
    });
    toast({ 
      title: "Perfil Atualizado!", 
      description: "Agora você pode postar seus hinos com sua identificação completa." 
    });
  };

  const handleAddHymn = (values: z.infer<typeof hymnFormSchema>) => {
    if (!hymnsColRef || !profile || !user) return;
    
    const newHymn = {
      title: values.title,
      lyrics: values.lyrics || "",
      solistaId: user.uid,
      solistaName: profile.username || user.email,
      conjunto: profile.conjunto,
      createdAt: serverTimestamp(),
    };

    addDocumentNonBlocking(hymnsColRef, newHymn);
    hymnForm.reset();
    setIsAddingHymn(false);
    toast({ title: "Hino Adicionado!", description: "Seu hino foi publicado e está disponível na galeria." });
  };

  const handleRemoveHymn = (id: string) => {
    if (!db) return;
    deleteDocumentNonBlocking(doc(db, "solistaHymns", id));
    toast({ title: "Hino Removido", description: "O hino foi excluído da galeria." });
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
      <Card className="border-dashed py-12 text-center">
        <CardContent className="space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Acesso aos Solistas</h2>
            <p className="mx-auto max-w-sm text-muted-foreground">
              Para ver os hinos dos solistas ou postar o seu, você precisa estar logado na plataforma.
            </p>
          </div>
          <Button className="mt-4" asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" /> Fazer Login agora
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {!profile?.conjunto && (
        <Card className="border-primary/50 bg-primary/5 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <PlusCircle className="text-primary"/> 
                Configure seu Perfil de Solista
            </CardTitle>
            <CardDescription>Para que os outros saibam quem você é, informe seu nome artístico e o conjunto que você representa.</CardDescription>
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
                        <FormLabel>Seu Nome / Nome do Solista</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Cantor João Silva" {...field} />
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
                        <FormLabel>Seu Conjunto Principal</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o conjunto" />
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
                <Button type="submit" className="w-full md:w-auto">Salvar Identificação</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {profile?.conjunto && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-primary">
              <Music className="h-6 w-6" /> Galeria de Solistas
            </h2>
            <Button onClick={() => setIsAddingHymn(!isAddingHymn)} variant={isAddingHymn ? "outline" : "default"}>
              {isAddingHymn ? "Fechar Formulário" : <><PlusCircle className="mr-2 h-4 w-4" /> Postar Meu Hino</>}
            </Button>
          </div>

          {isAddingHymn && (
            <Card className="animate-in fade-in slide-in-from-top-4">
              <CardHeader>
                <CardTitle>Postar Novo Hino</CardTitle>
                <CardDescription>O hino será postado em seu nome ({profile.username}) e vinculado ao conjunto {profile.conjunto}.</CardDescription>
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
                          <FormLabel>Letra do Hino (Opcional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Cole a letra completa do hino aqui (se houver)..." rows={8} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setIsAddingHymn(false)}>Cancelar</Button>
                        <Button type="submit">Publicar Agora</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por hino ou solista..." 
                    className="pl-9 bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="date" 
                    className="pl-9 bg-white"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white border rounded-md px-3 h-10">
                  <Filter className="h-4 w-4" />
                  <span>Exibindo {filteredHymns?.length || 0} hinos</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6">
            {filteredHymns?.map((hymn) => (
              <Card key={hymn.id} className="group overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-shadow">
                <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{hymn.title}</CardTitle>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5 font-medium text-foreground">
                            <User className="h-4 w-4 text-primary" /> {hymn.solistaName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" /> {hymn.createdAt ? format(new Date(hymn.createdAt.seconds * 1000), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "..."}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            {hymn.conjunto}
                          </span>
                        </div>
                      </div>
                      {hymn.solistaId === user.uid && (
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleRemoveHymn(hymn.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {hymn.lyrics && (
                      <div className="mt-6 border-t pt-4">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Letra / Repertório</h4>
                          <div className="text-muted-foreground whitespace-pre-wrap text-sm italic leading-relaxed bg-muted/20 p-4 rounded-lg">
                            {hymn.lyrics}
                          </div>
                      </div>
                    )}
                </div>
              </Card>
            ))}
            {filteredHymns?.length === 0 && !isLoading && (
              <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
                <Music className="mx-auto h-12 w-12 mb-4 opacity-20 text-primary" />
                <h3 className="text-lg font-semibold">Nenhum hino encontrado</h3>
                <p className="text-muted-foreground">Tente ajustar sua busca ou filtros de data.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
