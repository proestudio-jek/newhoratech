
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Newspaper, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { NewsArticle, UserProfile } from "@/lib/types";
import { collection, query, orderBy, serverTimestamp, doc, Timestamp, where } from "firebase/firestore";
import { useFirestore, useCollection, addDocumentNonBlocking, deleteDocumentNonBlocking, useMemoFirebase, useDoc } from "@/firebase";

const formSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres."),
  content: z.string().min(10, "A notícia deve ter pelo menos 10 caracteres."),
});

interface CommunityNewsProps {
  targetConjunto: string;
}

export function CommunityNews({ targetConjunto }: CommunityNewsProps) {
  const { user, isAdmin } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  
  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);
  const { data: profile } = useDoc<UserProfile>(userProfileRef);

  const newsCollectionRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "community-news");
  }, [db]);
  
  const newsQuery = useMemoFirebase(() => {
    if (!newsCollectionRef) return null;
    return query(
      newsCollectionRef, 
      where("conjunto", "==", targetConjunto),
      orderBy("date", "desc")
    );
  }, [newsCollectionRef, targetConjunto]);

  const { data: articles, isLoading } = useCollection<NewsArticle>(newsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const canPostNews = isAdmin || (profile?.status === 'approved' && profile?.conjunto === targetConjunto);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !newsCollectionRef) return;

    const newArticleData = {
      title: values.title,
      content: values.content,
      date: serverTimestamp(),
      authorId: user.uid,
      authorName: profile?.username || user.email,
      conjunto: targetConjunto,
    };

    addDocumentNonBlocking(newsCollectionRef, newArticleData);
    form.reset();
    setIsAdding(false);
    toast({
        title: "Notícia Publicada!",
        description: `O aviso "${values.title}" agora está visível para todos os membros do conjunto ${targetConjunto}.`,
    });
  }
  
  const handleRemoveArticle = async (id: string, authorId?: string) => {
    if (!db) return;
    
    // Apenas admin central ou o próprio autor pode remover (reforçado pelas rules)
    const docRef = doc(db, "community-news", id);
    deleteDocumentNonBlocking(docRef);
    toast({
        title: "Notícia Removida",
        description: "O aviso foi removido do mural."
    });
  }

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-64 rounded-lg border-2 border-dashed">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="space-y-6">
        {user && canPostNews && (
            <div className="flex justify-end">
                {!isAdding ? (
                    <Button onClick={() => setIsAdding(true)} className="shadow-md">
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Adicionar Aviso
                    </Button>
                ) : (
                    <Card className="w-full border-primary/20 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
                        <CardHeader className="bg-primary/5">
                            <CardTitle className="flex items-center gap-2">
                                <Newspaper className="h-5 w-5 text-primary" />
                                Publicar Novo Aviso
                            </CardTitle>
                            <CardDescription>
                            Esta notícia ficará visível na aba de Notícias do conjunto {targetConjunto}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Título do Aviso</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Ensaio Geral no Próximo Sábado" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Descrição Completa</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Descreva os detalhes importantes aqui..." {...field} rows={6} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                                    <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                                    <Button type="submit">Publicar no Mural</Button>
                                </div>
                            </form>
                            </Form>
                        </CardContent>
                    </Card>
                )}
            </div>
        )}

      {articles && articles.length > 0 ? (
        <div className="space-y-6">
          {articles.map((article) => {
            const articleDate = article.date instanceof Timestamp 
              ? article.date.toDate() 
              : article.date 
                ? new Date(article.date) 
                : null;
            
            const isDateValid = articleDate && !isNaN(articleDate.getTime());
            const canDelete = isAdmin || (user?.uid === (article as any).authorId);

            return (
              <Card key={article.id} className="group relative border-l-4 border-l-primary hover:shadow-md transition-all animate-in fade-in duration-500">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl text-primary">{article.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span className="font-semibold text-foreground/70">
                          Publicado em {isDateValid ? format(articleDate, "dd 'de' MMMM", { locale: ptBR }) : 'Agora mesmo'}
                        </span>
                        {isAdmin && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase">Admin</span>}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-foreground/80">{article.content}</p>
                </CardContent>
                {canDelete && (
                  <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveArticle(article.id, (article as any).authorId)}
                      aria-label={`Remover Notícia`}
                      className="absolute top-4 right-4 text-destructive hover:bg-destructive/10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  >
                      <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed bg-muted/20">
            <div className="text-center text-muted-foreground p-6">
                <Newspaper className="mx-auto h-16 w-16 mb-4 opacity-10 text-primary"/>
                <h2 className="text-xl font-semibold text-foreground/70">Nenhum Aviso no Momento</h2>
                <p className="text-sm max-w-xs mx-auto mt-2">
                    {canPostNews 
                        ? "Utilize o botão acima para publicar o primeiro aviso para este conjunto." 
                        : "Acompanhe esta aba para ficar por dentro das novidades e escalas do conjunto."}
                </p>
            </div>
        </div>
      )}
    </div>
  );
}
