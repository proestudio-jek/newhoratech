"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAdmin } from "@/contexts/AdminContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
import { PlusCircle, Trash2, Newspaper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { NewsArticle } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres."),
  content: z.string().min(10, "A notícia deve ter pelo menos 10 caracteres."),
});

const STORAGE_KEY = "community_news";

export function CommunityNews() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
      const storedArticles = localStorage.getItem(STORAGE_KEY);
      if (storedArticles) {
        setArticles(JSON.parse(storedArticles));
      }
    } catch (error) {
      console.error("Failed to load news from localStorage", error);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
      } catch (error) {
        console.error("Failed to save news to localStorage", error);
      }
    }
  }, [articles, isMounted]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newArticle: NewsArticle = {
      id: new Date().getTime().toString(),
      title: values.title,
      content: values.content,
      date: new Date().toISOString(),
    };

    setArticles((prev) => [newArticle, ...prev]);
    form.reset();
    setIsAdding(false);
    toast({
        title: "Notícia Publicada!",
        description: `O artigo "${values.title}" foi publicado.`,
    });
  }
  
  const handleRemoveArticle = (id: string) => {
    setArticles(articles.filter(item => item.id !== id));
    toast({
        title: "Notícia Removida",
        description: "O artigo foi removido."
    })
  }

  if (!isMounted) {
    return null; // or a loading skeleton
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
                <p>O administrador ainda não publicou notícias nesta seção.</p>
            </div>
        </div>
      )}
    </div>
  );
}
