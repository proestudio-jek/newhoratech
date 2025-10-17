
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
import { PlusCircle, Trash2, ListMusic, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PlaylistItem } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";

const formSchema = z.object({
  title: z.string().min(3, "O nome do hino deve ter pelo menos 3 caracteres."),
});


export function CommunityPlaylists() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const playlistCollection = collection(db, "community-playlist");
        const q = query(playlistCollection, orderBy("createdAt", "asc"));
        const playlistSnapshot = await getDocs(q);
        const playlistItems = playlistSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title
        }));
        setPlaylist(playlistItems);
      } catch (error) {
        console.error("Failed to load playlist from Firestore", error);
        toast({
          variant: "destructive",
          title: "Erro ao Carregar Playlist",
          description: "Não foi possível buscar a playlist do banco de dados.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylist();
  }, [toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    
    const newHymnData = {
      title: values.title,
      createdAt: new Date(),
    };

    try {
        const docRef = await addDoc(collection(db, "community-playlist"), newHymnData);
        const newHymn: PlaylistItem = {
          id: docRef.id,
          title: values.title,
        };

        setPlaylist((prev) => [...prev, newHymn]);
        form.reset();
        toast({
            title: "Hino Adicionado!",
            description: `"${values.title}" foi adicionado à playlist.`,
        });
    } catch(error) {
        console.error("Error adding hymn: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao Adicionar",
            description: "Não foi possível adicionar o hino à playlist.",
        });
    }
  }

  const handleRemoveHymn = async (id: string) => {
    try {
        await deleteDoc(doc(db, "community-playlist", id));
        setPlaylist(playlist.filter(item => item.id !== id));
        toast({
            title: "Hino Removido",
            description: "O hino foi removido da playlist."
        })
    } catch(error) {
        console.error("Error removing hymn: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao Remover",
            description: "Não foi possível remover o hino.",
        })
    }
  }

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-96 rounded-lg border-2 border-dashed">
            <div className="text-center text-muted-foreground">
                <Loader2 className="mx-auto h-12 w-12 animate-spin mb-4"/>
                <h2 className="text-2xl font-semibold">Carregando Playlist...</h2>
            </div>
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
              Insira o nome de um hino para adicioná-lo à playlist da comunidade.
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
                  <PlusCircle className="mr-2" /> Adicionar Hino
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {playlist.length > 0 ? (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ListMusic className="text-primary"/>
                    Playlist da Comunidade
                </CardTitle>
            </CardHeader>
            <CardContent>
                 <ul className="space-y-3">
                    {playlist.map((item, index) => (
                    <li
                        key={item.id}
                        className="flex items-center justify-between rounded-md border p-3 group"
                    >
                        <div className="flex items-center gap-3">
                        <span className="text-muted-foreground font-medium">{index + 1}.</span>
                        <span className="font-medium">{item.title}</span>
                        </div>
                        {user && isAdmin && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveHymn(item.id)}
                            aria-label={`Remover ${item.title}`}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
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
        <div className="flex items-center justify-center h-96 rounded-lg border-2 border-dashed">
            <div className="text-center text-muted-foreground">
                <ListMusic className="mx-auto h-12 w-12 mb-4"/>
                <h2 className="text-2xl font-semibold">Playlist Vazia</h2>
                <p>O administrador ainda não adicionou hinos a esta playlist.</p>
            </div>
        </div>
      )}
    </div>
  );
}
