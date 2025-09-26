"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdmin } from "@/contexts/AdminContext";
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
import { PlusCircle, Trash2, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CommunityVideo } from "@/lib/types";

const formSchema = z.object({
  videoUrl: z.string().url("Por favor, insira uma URL válida do YouTube."),
});

function getYoutubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

const STORAGE_KEY = "community_videos";

export function CommunityVideos() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [videos, setVideos] = useState<CommunityVideo[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
      const storedVideos = localStorage.getItem(STORAGE_KEY);
      if (storedVideos) {
        setVideos(JSON.parse(storedVideos));
      }
    } catch (error) {
      console.error("Failed to load videos from localStorage", error);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
      } catch (error) {
        console.error("Failed to save videos to localStorage", error);
      }
    }
  }, [videos, isMounted]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoUrl: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const youtubeId = getYoutubeId(values.videoUrl);
    if (!youtubeId) {
      toast({
        variant: "destructive",
        title: "URL Inválida",
        description: "A URL do YouTube fornecida não é válida.",
      });
      return;
    }

    const newVideo: CommunityVideo = {
      id: new Date().getTime().toString(),
      youtubeId: youtubeId,
      title: `Vídeo ${videos.length + 1}`, // Placeholder title
    };

    setVideos((prev) => [...prev, newVideo]);
    form.reset();
    toast({
        title: "Vídeo Adicionado!",
        description: "O vídeo do YouTube foi adicionado à galeria.",
    });
  }

  const handleRemoveVideo = (id: string) => {
    setVideos(videos.filter(v => v.id !== id));
    toast({
        title: "Vídeo Removido",
        description: "O vídeo foi removido da galeria."
    })
  }

  if (!isMounted) {
    return null; // or a loading skeleton
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-end gap-4">
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem className="flex-grow w-full">
                      <FormLabel>URL do YouTube</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full sm:w-auto">
                  <PlusCircle className="mr-2" /> Adicionar Vídeo
                </Button>
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
                 <h3 className="font-semibold text-lg flex items-center gap-2"> <Youtube className="text-red-500"/> {video.title}</h3>
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
