"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestore, useCollection, addDocumentNonBlocking, deleteDocumentNonBlocking, useMemoFirebase, updateDocumentNonBlocking, useDoc } from "@/firebase";
import { collection, query, orderBy, serverTimestamp, doc, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Search, Calendar as CalendarIcon, User, Music, Trash2, Filter, LogIn, CalendarPlus, Clock, CheckCircle2, XCircle, Edit, Save, ListPlus, ListChecks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { SolistaHymn, UserProfile } from "@/lib/types";
import Link from "next/link";

const hymnFormSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
  lyrics: z.string().optional(),
});

const profileFormSchema = z.object({
  username: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  conjunto: z.string().min(1, "Selecione o conjunto ao qual você pertence."),
});

interface SolistaSectionProps {
  targetConjunto?: string;
}

export function SolistaSection({ targetConjunto }: SolistaSectionProps) {
  const { user, isAdmin } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [isAddingHymn, setIsAddingHymn] = useState(false);
  const [editingHymn, setEditingHymn] = useState<SolistaHymn | null>(null);
  const [schedulingHymn, setSchedulingHymn] = useState<SolistaHymn | null>(null);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<Date | undefined>(new Date());
  const [viewOnlyMine, setViewOnlyMine] = useState(false);
  const [selectedHymnIds, setSelectedHymnIds] = useState<string[]>([]);

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);
  
  const { data: profile } = useDoc<UserProfile>(userRef);

  const hymnsColRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "solistaHymns");
  }, [db]);

  const playlistColRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "community-playlist");
  }, [db]);

  const calendarColRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "calendarEntries");
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

  const editForm = useForm<z.infer<typeof hymnFormSchema>>({
    resolver: zodResolver(hymnFormSchema),
    defaultValues: { title: "", lyrics: "" },
  });

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { 
      username: "", 
      conjunto: targetConjunto || "" 
    },
  });

  useEffect(() => {
    if (profile?.username) {
        profileForm.setValue("username", profile.username);
    }
    if (profile?.conjunto) {
        profileForm.setValue("conjunto", profile.conjunto);
    }
  }, [profile, profileForm]);

  const handleUpdateProfile = (values: z.infer<typeof profileFormSchema>) => {
    if (!userRef) return;
    updateDocumentNonBlocking(userRef, {
      username: values.username,
      conjunto: values.conjunto,
      status: "pending",
    });
    toast({ 
      title: "Solicitação Enviada!", 
      description: "Seu perfil foi enviado para aprovação administrativa." 
    });
  };

  const handleAddHymn = (values: z.infer<typeof hymnFormSchema>) => {
    if (!hymnsColRef || !profile || !user || profile.status !== 'approved') return;
    
    const newHymn = {
      title: values.title,
      lyrics: values.lyrics || "",
      solistaId: user.uid,
      solistaName: profile.username || user.email,
      conjunto: profile.conjunto || targetConjunto || "Geral",
      createdAt: serverTimestamp(),
    };

    addDocumentNonBlocking(hymnsColRef, newHymn);
    hymnForm.reset();
    setIsAddingHymn(false);
    toast({ title: "Hino Adicionado!", description: "Seu hino foi publicado e está disponível na galeria." });
  };

  const handleStartEdit = (hymn: SolistaHymn) => {
    setEditingHymn(hymn);
    editForm.reset({
      title: hymn.title,
      lyrics: hymn.lyrics || "",
    });
  };

  const handleSaveEdit = (values: z.infer<typeof hymnFormSchema>) => {
    if (!db || !editingHymn) return;
    const docRef = doc(db, "solistaHymns", editingHymn.id);
    updateDocumentNonBlocking(docRef, {
      title: values.title,
      lyrics: values.lyrics || "",
    });
    setEditingHymn(null);
    toast({ title: "Hino Atualizado", description: "As alterações foram salvas com sucesso." });
  };

  const handleRemoveHymn = (id: string) => {
    if (!db) return;
    deleteDocumentNonBlocking(doc(db, "solistaHymns", id));
    toast({ title: "Hino Removido", description: "O hino foi excluído da galeria." });
  };

  const handleScheduleHymn = () => {
    if (!schedulingHymn || !selectedScheduleDate || !calendarColRef) return;

    const newEntry = {
      hymnId: schedulingHymn.id,
      hymnTitle: schedulingHymn.title,
      date: Timestamp.fromDate(selectedScheduleDate),
      conjunto: schedulingHymn.conjunto,
      createdAt: serverTimestamp(),
    };

    addDocumentNonBlocking(calendarColRef, newEntry);
    setSchedulingHymn(null);
    toast({
      title: "Hino Agendado!",
      description: `"${schedulingHymn.title}" foi agendado para ${format(selectedScheduleDate, "dd/MM/yyyy")}.`,
    });
  };

  const handleToggleSelectHymn = (id: string) => {
    setSelectedHymnIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkAddToPlaylist = () => {
    if (!playlistColRef || !allHymns || !user) return;

    // Use ensemble from current context or ensemble of the selected hymns
    const selectedHymnsData = allHymns.filter(h => selectedHymnIds.includes(h.id));
    
    selectedHymnsData.forEach(hymn => {
      addDocumentNonBlocking(playlistColRef, {
        title: hymn.title,
        conjunto: targetConjunto || hymn.conjunto,
        createdAt: serverTimestamp(),
        addedBy: user.uid,
      });
    });

    setSelectedHymnIds([]);
    toast({
      title: "Hinos Adicionados",
      description: `${selectedHymnsData.length} hinos foram adicionados à playlist.`,
    });
  };

  const filteredHymns = allHymns?.filter(hymn => {
    const matchesConjunto = !targetConjunto || hymn.conjunto === targetConjunto;
    const matchesSearch = hymn.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (hymn.solistaName && hymn.solistaName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const hymnDate = hymn.createdAt && hymn.createdAt.seconds 
      ? format(new Date(hymn.createdAt.seconds * 1000), "yyyy-MM-dd") 
      : "";
    const matchesDate = filterDate === "" || hymnDate === filterDate;
    
    const matchesOwnership = !viewOnlyMine || hymn.solistaId === user?.uid;
    
    return matchesConjunto && matchesSearch && matchesDate && matchesOwnership;
  });

  if (!user) {
    return (
      <Card className="border-dashed py-12 text-center">
        <CardContent className="space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Portal do Solista</h2>
            <p className="mx-auto max-w-sm text-muted-foreground">
              Para compartilhar seus hinos ou gerenciar seu repertório, faça login em sua conta PROMUSIC.
            </p>
          </div>
          <div className="flex justify-center gap-4 pt-4">
            <Button asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" /> Entrar
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup">Criar Conta</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const canManagePlaylist = isAdmin || (profile?.status === 'approved' && profile?.conjunto === targetConjunto);

  return (
    <div className="space-y-8">
      {/* Fluxo de Cadastro/Status do Solista */}
      {(!profile?.username || !profile?.conjunto) && !isAdmin ? (
        <Card className="border-primary/50 bg-primary/5 shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Music className="text-primary"/> 
                Torne-se um Solista
            </CardTitle>
            <CardDescription>
              Complete seu perfil para começar a postar seus hinos e ser agendado nos conjuntos.
            </CardDescription>
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
                        <FormLabel>Nome Artístico / Solista</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Cantor Carlos Alencar" {...field} />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value || targetConjunto}>
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
                <Button type="submit" className="w-full md:w-auto">Solicitar Acesso Solista</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : profile?.status === 'pending' && !isAdmin ? (
        <Alert className="bg-amber-50 border-amber-200 py-6">
          <Clock className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800 text-lg">Aguardando Aprovação</AlertTitle>
          <AlertDescription className="text-amber-700">
            Sua solicitação para o conjunto <strong>{profile.conjunto}</strong> está em análise. 
            Você receberá permissão para postar hinos em breve.
          </AlertDescription>
        </Alert>
      ) : profile?.status === 'rejected' && !isAdmin ? (
        <Alert variant="destructive" className="py-6">
          <XCircle className="h-5 w-5" />
          <AlertTitle className="text-lg">Solicitação Não Aprovada</AlertTitle>
          <AlertDescription>
            Sua conta de solista não foi habilitada desta vez. Para mais informações, consulte a coordenação do seu conjunto.
          </AlertDescription>
        </Alert>
      ) : (profile?.status === 'approved' || isAdmin) && (
        <Alert className="bg-green-50 border-green-200 py-4">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800">{isAdmin ? "Modo Administrativo Ativado" : "Solista Verificado"}</AlertTitle>
          <AlertDescription className="text-green-700">
            {isAdmin ? "Você tem acesso total para gerenciar o repertório de todos os solistas." : <>Bem-vindo, <strong>{profile?.username}</strong>! Você está ativo no conjunto <strong>{profile?.conjunto}</strong>.</>}
          </AlertDescription>
        </Alert>
      )}

      {/* Área de Adição de Hino para Solista Logado ou Admin */}
      {(profile?.status === 'approved' || isAdmin) && (
        <Card className="border-2 border-primary/20 shadow-md">
           <CardHeader className="pb-4">
             <CardTitle className="text-xl flex items-center gap-2">
               <ListPlus className="text-primary h-5 w-5" />
               Adicionar Hino ao Repertório
             </CardTitle>
             <CardDescription>Inclua novos hinos {isAdmin ? "ao banco de dados geral" : "que você está ensaiando"}.</CardDescription>
           </CardHeader>
           <CardContent>
             <Form {...hymnForm}>
                <form onSubmit={hymnForm.handleSubmit(handleAddHymn)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={hymnForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="md:col-span-1">
                          <FormLabel>Título do Hino</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Quão Grande És Tu" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={hymnForm.control}
                      name="lyrics"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Letra / Cifra ou Link (Opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Insira a letra curta ou um link para auxílio..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">
                      <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Hino
                    </Button>
                  </div>
                </form>
             </Form>
           </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-primary">
            <Music className="h-6 w-6" /> Repertório de Solistas {targetConjunto ? `- ${targetConjunto}` : "Geral"}
          </h2>
          <div className="flex items-center gap-2">
            {(profile?.status === 'approved' || isAdmin) && (
              <Button 
                variant={viewOnlyMine ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setViewOnlyMine(!viewOnlyMine)}
              >
                {viewOnlyMine ? "Ver Todos" : "Meus Hinos"}
              </Button>
            )}
          </div>
        </div>

        {selectedHymnIds.length > 0 && canManagePlaylist && (
          <Card className="bg-primary/5 border-primary/20 sticky top-20 z-10 shadow-lg">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                <span className="font-semibold">{selectedHymnIds.length} hinos selecionados</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={() => setSelectedHymnIds([])} className="flex-1 sm:flex-none">
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleBulkAddToPlaylist} className="flex-1 sm:flex-none">
                  Adicionar à Playlist {targetConjunto ? `de ${targetConjunto}` : ""}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Pesquisar hino ou solista..." 
                  className="pl-9 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="date" 
                  className="pl-9 bg-white"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white border rounded-md px-3 h-10">
                <Filter className="h-4 w-4" />
                <span>{filteredHymns?.length || 0} hinos encontrados</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          {filteredHymns?.map((hymn) => (
            <Card key={hymn.id} className={`group overflow-hidden border-l-4 transition-all duration-200 ${selectedHymnIds.includes(hymn.id) ? 'border-l-primary bg-primary/5 shadow-md' : 'border-l-primary/30 hover:shadow-md'}`}>
              <div className="p-4 sm:p-6 flex gap-4 items-start">
                  {canManagePlaylist && (
                    <div className="pt-1">
                      <Checkbox 
                        checked={selectedHymnIds.includes(hymn.id)} 
                        onCheckedChange={() => handleToggleSelectHymn(hymn.id)}
                        className="size-5"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors flex items-center gap-2">
                          <Music className="h-5 w-5 text-primary" />
                          {hymn.title}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5 font-medium text-foreground">
                            <User className="h-4 w-4 text-primary" /> {hymn.solistaName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <CalendarIcon className="h-4 w-4" /> {hymn.createdAt && hymn.createdAt.seconds ? format(new Date(hymn.createdAt.seconds * 1000), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Recente"}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            {hymn.conjunto}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-primary hover:bg-primary/10"
                          onClick={() => setSchedulingHymn(hymn)}
                          title="Agendar Apresentação"
                        >
                          <CalendarPlus className="h-4 w-4" />
                        </Button>
                        {(hymn.solistaId === user.uid || isAdmin) && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-blue-600 hover:bg-blue-50" 
                              onClick={() => handleStartEdit(hymn)}
                              title="Editar Hino"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:bg-destructive/10" 
                              onClick={() => handleRemoveHymn(hymn.id)}
                              title="Excluir Hino"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {hymn.lyrics && (
                      <div className="mt-6 border-t pt-4">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Informações Adicionais</h4>
                          <div className="text-muted-foreground whitespace-pre-wrap text-sm italic leading-relaxed bg-muted/20 p-4 rounded-lg">
                            {hymn.lyrics}
                          </div>
                      </div>
                    )}
                  </div>
              </div>
            </Card>
          ))}
          {filteredHymns?.length === 0 && !isLoading && (
            <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
              <Music className="mx-auto h-12 w-12 mb-4 opacity-20 text-primary" />
              <h3 className="text-lg font-semibold">Sem hinos para exibir</h3>
              <p className="text-muted-foreground">Utilize os filtros acima ou aguarde novas publicações.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Agendamento */}
      <Dialog open={!!schedulingHymn} onOpenChange={() => setSchedulingHymn(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agendar Apresentação</DialogTitle>
            <DialogDescription>
              Selecione a data para o hino "{schedulingHymn?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Calendar
              mode="single"
              selected={selectedScheduleDate}
              onSelect={setSelectedScheduleDate}
              locale={ptBR}
              className="rounded-md border"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSchedulingHymn(null)}>Cancelar</Button>
            <Button onClick={handleScheduleHymn} disabled={!selectedScheduleDate}>Confirmar Agendamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={!!editingHymn} onOpenChange={() => setEditingHymn(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Hino</DialogTitle>
            <DialogDescription>
              Atualize as informações do hino publicado.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleSaveEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="lyrics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Letra / Cifra</FormLabel>
                    <FormControl>
                      <Textarea rows={10} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setEditingHymn(null)}>Cancelar</Button>
                <Button type="submit"><Save className="mr-2 h-4 w-4" /> Salvar Alterações</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}