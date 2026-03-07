
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
import { PlusCircle, Trash2, Newspaper, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { NewsArticle } from "@/lib/types";
import { collection, query, orderBy, serverTimestamp, doc, Timestamp, where } from "firebase/firestore";
import { useFirestore, useCollection, addDocumentNonBlocking, deleteDocumentNonBlocking, useMemoFirebase } from "@/firebase";

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !newsCollectionRef) return;

    const newArticleData = {
      title: values.title,
      content: values.content,
      date: serverTimestamp(),
      authorId: user.uid,
      conjunto: targetConjunto,
    };

    addDocumentNonBlocking(newsCollectionRef, newArticleData);
    form.reset();
    setIsAdding(false);
    toast({
        title: "Notícia Publicada!",
        description: `O artigo "${values.title}" foi publicado em ${targetConjunto}.`,
    });
  }
  
  const handleRemoveArticle = async (id: string) => {
    if (!db) return;
    const docRef = doc(db, "community-news", id);
    deleteDocumentNonBlocking(docRef);
    toast({
        title: "Notícia Removida",
        description: "O artigo foi removido."
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
        {user && isAdmin && (
            <div className="flex justify-end">
                {!isAdding ? (
                    <Button onClick={() => setIsAdding(true)}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Adicionar Notícia
                    </Button>
                ) : (
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Publicar Nova Notícia</CardTitle>
                            <CardDescription>
                            Escreva e publique uma nova notícia para o conjunto {targetConjunto}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Título da Notícia</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Próximo Ensaio do Coral" {...field} />
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
                                    <FormLabel>Conteúdo da Notícia</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Descreva os detalhes da notícia aqui..." {...field} rows={5} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <div className="flex flex-col sm:flex-row justify-end gap-2">
                                    <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                                    <Button type="submit">Publicar</Button>
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

            return (
              <Card key={article.id} className="group relative">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl">{article.title}</CardTitle>
                  <CardDescription>
                    Publicado em {isDateValid ? format(articleDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Data pendente'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{article.content}</p>
                </CardContent>
                {user && isAdmin && (
                  <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveArticle(article.id)}
                      aria-label={`Remover Notícia`}
                      className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  >
                      <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 rounded-lg border-2 border-dashed">
            <div className="text-center text-muted-foreground p-4">
                <Newspaper className="mx-auto h-12 w-12 mb-4 opacity-20"/>
                <h2 className="text-xl font-semibold">Nenhuma Notícia Publicada</h2>
                {isAdmin ? <p className="text-sm">Adicione a primeira notícia no botão acima.</p> : <p className="text-sm">Ainda não há notícias para este conjunto.</p>}
            </div>
        </div>
      )}
    </div>
  );
}
