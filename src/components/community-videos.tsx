
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { PlusCircle, Trash2, Youtube, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CommunityVideo } from "@/lib/types";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";

const formSchema = z.object({
  videoUrl: z.string().url("Por favor, insira uma URL válida do YouTube."),
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
});

function getYoutubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export function CommunityVideos() {
  const { user, isAdmin, db } = useAuth();
  const { toast } = useToast();
  const [videos, setVideos] = useState<CommunityVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    const fetchVideos = async () => {
      try {
        const videosCollection = collection(db, "community-videos");
        const q = query(videosCollection, orderBy("createdAt", "desc"));
        const videosSnapshot = await getDocs(q);
        const videosList = videosSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                youtubeId: data.youtubeId,
                title: data.title,
            }
        });
        setVideos(videosList);
      } catch (error) {
        console.error("Failed to load videos from Firestore", error);
        toast({
          variant: "destructive",
          title: "Erro ao Carregar Vídeos",
          description: "Não foi possível buscar os vídeos do banco de dados.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, [db, toast]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoUrl: "",
      title: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if(!user || !db) return;

    const youtubeId = getYoutubeId(values.videoUrl);
    if (!youtubeId) {
      toast({
        variant: "destructive",
        title: "URL Inválida",
        description: "A URL do YouTube fornecida não é válida.",
      });
      return;
    }

    const newVideoData = {
      youtubeId: youtubeId,
      title: values.title,
      createdAt: new Date(),
      addedBy: user.uid,
    };

    try {
      const docRef = await addDoc(collection(db, "community-videos"), newVideoData);
      const newVideo: CommunityVideo = {
        id: docRef.id,
        youtubeId: newVideoData.youtubeId,
        title: newVideoData.title,
      };

      setVideos((prev) => [newVideo, ...prev]);
      form.reset();
      toast({
          title: "Vídeo Adicionado!",
          description: "O vídeo do YouTube foi adicionado à galeria.",
      });
    } catch (error) {
        console.error("Error adding video: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao Adicionar",
            description: "Não foi possível adicionar o vídeo.",
        });
    }
  }

  const handleRemoveVideo = async (id: string) => {
    if (!db) return;
    try {
        await deleteDoc(doc(db, "community-videos", id));
        setVideos(videos.filter(v => v.id !== id));
        toast({
            title: "Vídeo Removido",
            description: "O vídeo foi removido da galeria."
        })
    } catch(error) {
        console.error("Error removing video: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao Remover",
            description: "Não foi possível remover o vídeo.",
        });
    }
  }

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-96 rounded-lg border-2 border-dashed">
            <div className="text-center text-muted-foreground">
                <Loader2 className="mx-auto h-12 w-12 animate-spin mb-4"/>
                <h2 className="text-2xl font-semibold">Carregando Vídeos...</h2>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {user && isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Novo Vídeo</CardTitle>
            <CardDescription>
              Cole a URL de um vídeo do YouTube para adicioná-lo à galeria da
              comunidade.
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
                      <FormLabel>Título do Vídeo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Coro Magnificat em Performance" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do YouTube</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                    <Button type="submit">
                        <PlusCircle className="mr-2" /> Adicionar Vídeo
                    </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {videos.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Card key={video.id} className="group relative">
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtubeId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                ></iframe>
              </div>
              <CardContent className="p-4">
                 <h3 className="font-semibold text-lg flex items-center gap-2 truncate"> <Youtube className="text-red-500 flex-shrink-0"/> {video.title}</h3>
              </CardContent>
              {user && isAdmin && (
                <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveVideo(video.id)}
                    aria-label={`Remover Vídeo`}
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
                <Youtube className="mx-auto h-12 w-12 mb-4"/>
                <h2 className="text-2xl font-semibold">Nenhum Vídeo Adicionado</h2>
                <p>O administrador ainda não adicionou vídeos a esta seção.</p>
            </div>
        </div>
      )}
    </div>
  );
}
