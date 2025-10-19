
"use client";

import { useState, useEffect } from "react";
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
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from "firebase/firestore";


const formSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres."),
  content: z.string().min(10, "A notícia deve ter pelo menos 10 caracteres."),
});

export function CommunityNews() {
  const { user, isAdmin, db } = useAuth();
  const { toast } = useToast();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    
    const fetchArticles = async () => {
      try {
        const articlesCollection = collection(db, "community-news");
        const q = query(articlesCollection, orderBy("date", "desc"));
        const articlesSnapshot = await getDocs(q);
        const articlesList = articlesSnapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            title: data.title,
            content: data.content,
            date: (data.date as Timestamp).toDate().toISOString() 
          };
        });
        setArticles(articlesList);
      } catch (error) {
        console.error("Failed to load news from Firestore", error);
        toast({
          variant: "destructive",
          title: "Erro ao Carregar Notícias",
          description: "Não foi possível carregar as notícias do banco de dados.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [db, toast]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !db) return;

    const newArticleData = {
      title: values.title,
      content: values.content,
      date: new Date(),
      authorId: user.uid,
    };

    try {
      const docRef = await addDoc(collection(db, "community-news"), newArticleData);
      const newArticle: NewsArticle = {
        id: docRef.id,
        title: newArticleData.title,
        content: newArticleData.content,
        date: newArticleData.date.toISOString(),
      }
      setArticles((prev) => [newArticle, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      form.reset();
      setIsAdding(false);
      toast({
          title: "Notícia Publicada!",
          description: `O artigo "${values.title}" foi publicado.`,
      });
    } catch(error) {
       console.error("Error adding document: ", error);
       toast({
        variant: "destructive",
        title: "Erro ao Publicar",
        description: "Não foi possível salvar a notícia.",
      });
    }
  }
  
  const handleRemoveArticle = async (id: string) => {
    if (!db) return;
    try {
        await deleteDoc(doc(db, "community-news", id));
        setArticles(articles.filter(item => item.id !== id));
        toast({
            title: "Notícia Removida",
            description: "O artigo foi removido."
        })
    } catch (error) {
        console.error("Error removing document: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao Remover",
            description: "Não foi possível remover a notícia."
        });
    }
  }

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-96 rounded-lg border-2 border-dashed">
            <div className="text-center text-muted-foreground">
                <Loader2 className="mx-auto h-12 w-12 animate-spin mb-4"/>
                <h2 className="text-2xl font-semibold">Carregando Notícias...</h2>
                <p>Buscando as últimas novidades no banco de dados.</p>
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-6">
        {user && isAdmin && (
            <div className="flex justify-end">
                {!isAdding ? (
                    <Button onClick={() => setIsAdding(true)}>
                        <PlusCircle className="mr-2"/>
                        Adicionar Notícia
                    </Button>
                ) : (
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Publicar Nova Notícia</CardTitle>
                            <CardDescription>
                            Escreva e publique uma nova notícia para a comunidade.
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
                                <div className="flex justify-end gap-2">
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

      {articles.length > 0 ? (
        <div className="space-y-6">
          {articles.map((article) => (
            <Card key={article.id} className="group relative">
              <CardHeader>
                <CardTitle>{article.title}</CardTitle>
                <CardDescription>
                  Publicado em {format(new Date(article.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{article.content}</p>
              </CardContent>
              {user && isAdmin && (
                <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveArticle(article.id)}
                    aria-label={`Remover Notícia`}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-96 rounded-lg border-2 border-dashed">
            <div className="text-center text-muted-foreground">
                <Newspaper className="mx-auto h-12 w-12 mb-4"/>
                <h2 className="text-2xl font-semibold">Nenhuma Notícia Publicada</h2>
                {isAdmin ? <p>Adicione a primeira notícia no botão acima.</p> : <p>O administrador ainda não publicou notícias nesta seção.</p>}
            </div>
        </div>
      )}
    </div>
  );
}
