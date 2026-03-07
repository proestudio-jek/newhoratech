
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
import { PlusCircle, Trash2, ListMusic, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PlaylistItem } from "@/lib/types";
import { collection, query, orderBy, doc, serverTimestamp, where } from "firebase/firestore";
import { useFirestore, useCollection, addDocumentNonBlocking, deleteDocumentNonBlocking, useMemoFirebase } from "@/firebase";

const formSchema = z.object({
  title: z.string().min(3, "O nome do hino deve ter pelo menos 3 caracteres."),
});

interface CommunityPlaylistsProps {
  targetConjunto: string;
}

export function CommunityPlaylists({ targetConjunto }: CommunityPlaylistsProps) {
  const { user, isAdmin } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const playlistCollectionRef = useMemoFirebase(() => {
    if(!db) return null;
    return collection(db, "community-playlist")
  }, [db]);

  const playlistQuery = useMemoFirebase(() => {
    if(!playlistCollectionRef) return null;
    return query(
      playlistCollectionRef, 
      where("conjunto", "==", targetConjunto),
      orderBy("createdAt", "asc")
    );
  }, [playlistCollectionRef, targetConjunto]);

  const { data: playlist, isLoading } = useCollection<PlaylistItem>(playlistQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !playlistCollectionRef) return;
    
    const newHymnData = {
      title: values.title,
      createdAt: serverTimestamp(),
      conjunto: targetConjunto,
    };

    addDocumentNonBlocking(playlistCollectionRef, newHymnData);
    form.reset();
    toast({
        title: "Hino Adicionado!",
        description: `"${values.title}" foi adicionado à playlist de ${targetConjunto}.`,
    });
  }

  const handleRemoveHymn = async (id: string) => {
    if (!db) return;
    const docRef = doc(db, "community-playlist", id);
    deleteDocumentNonBlocking(docRef);
    toast({
        title: "Hino Removido",
        description: "O hino foi removido da playlist."
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
            <CardTitle>Adicionar Hino à Playlist</CardTitle>
            <CardDescription>
              Hinos específicos para o conjunto {targetConjunto}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-end gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="flex-grow w-full">
                      <FormLabel>Nome do Hino</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Quão Grande És Tu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Hino
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {playlist && playlist.length > 0 ? (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <ListMusic className="text-primary h-5 w-5"/>
                    Playlist: {targetConjunto}
                </CardTitle>
            </CardHeader>
            <CardContent>
                 <ul className="space-y-2">
                    {playlist.map((item, index) => (
                    <li
                        key={item.id}
                        className="flex items-center justify-between rounded-md border p-3 group hover:bg-muted/30 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                        <span className="text-muted-foreground font-mono text-xs">{index + 1}.</span>
                        <span className="font-medium text-sm sm:text-base">{item.title}</span>
                        </div>
                        {user && isAdmin && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveHymn(item.id)}
                            aria-label={`Remover ${item.title}`}
                            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-8 w-8"
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        )}
                    </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      ) : (
        <div className="flex items-center justify-center h-64 rounded-lg border-2 border-dashed">
            <div className="text-center text-muted-foreground p-4">
                <ListMusic className="mx-auto h-12 w-12 mb-4 opacity-20"/>
                <h2 className="text-xl font-semibold">Playlist Vazia</h2>
                {isAdmin ? <p className="text-sm">Comece a montar o repertório deste conjunto acima.</p> : <p className="text-sm">Ainda não há hinos nesta playlist.</p>}
            </div>
        </div>
      )}
    </div>
  );
}
