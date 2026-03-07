
"use client";

import { useState } from "react";
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
import { collection, query, orderBy, doc, serverTimestamp, where } from "firebase/firestore";
import { useFirestore, useCollection, addDocumentNonBlocking, deleteDocumentNonBlocking, useMemoFirebase } from "@/firebase";

const formSchema = z.object({
  videoUrl: z.string().url("Por favor, insira uma URL válida do YouTube."),
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
});

function getYoutubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

interface CommunityVideosProps {
  targetConjunto: string;
}

export function CommunityVideos({ targetConjunto }: CommunityVideosProps) {
  const { user, isAdmin } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const videosCollectionRef = useMemoFirebase(() => {
    if(!db) return null;
    return collection(db, "community-videos")
  }, [db]);

  const videosQuery = useMemoFirebase(() => {
    if(!videosCollectionRef) return null;
    return query(
      videosCollectionRef, 
      where("conjunto", "==", targetConjunto),
      orderBy("createdAt", "desc")
    );
  }, [videosCollectionRef, targetConjunto]);

  const { data: videos, isLoading } = useCollection<CommunityVideo>(videosQuery);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoUrl: "",
      title: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if(!user || !videosCollectionRef) return;

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
      createdAt: serverTimestamp(),
      addedBy: user.uid,
      conjunto: targetConjunto,
    };
    
    addDocumentNonBlocking(videosCollectionRef, newVideoData);
    form.reset();
    toast({
        title: "Vídeo Adicionado!",
        description: `O vídeo foi adicionado à galeria do conjunto ${targetConjunto}.`,
    });
  }

  const handleRemoveVideo = async (id: string) => {
    if (!db) return;
    const docRef = doc(db, "community-videos", id);
    deleteDocumentNonBlocking(docRef);
    toast({
        title: "Vídeo Removido",
        description: "O vídeo foi removido da galeria."
    })
  }

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-64 rounded-lg border-2 border-dashed">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {user && isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Vídeo - {targetConjunto}</CardTitle>
            <CardDescription>
              Cole a URL do YouTube para compartilhar um momento deste conjunto.
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
                        <Input placeholder="Ex: Apresentação Especial" {...field} />
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
                    <Button type="submit" className="w-full sm:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Vídeo
                    </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Card key={video.id} className="group relative overflow-hidden">
              <div className="aspect-video overflow-hidden">
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
                 <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 truncate"> 
                   <Youtube className="text-red-500 flex-shrink-0 h-5 w-5"/> 
                   {video.title}
                 </h3>
              </CardContent>
              {user && isAdmin && (
                <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveVideo(video.id)}
                    aria-label={`Remover Vídeo`}
                    className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-8 w-8"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 rounded-lg border-2 border-dashed">
            <div className="text-center text-muted-foreground p-4">
                <Youtube className="mx-auto h-12 w-12 mb-4 opacity-20"/>
                <h2 className="text-xl font-semibold">Nenhum Vídeo</h2>
                {isAdmin ? <p className="text-sm">Adicione o primeiro vídeo deste conjunto acima.</p> : <p className="text-sm">A galeria de vídeos ainda está vazia.</p>}
            </div>
        </div>
      )}
    </div>
  );
}
