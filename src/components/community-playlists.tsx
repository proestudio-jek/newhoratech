"use client";

import { useState } from "react";
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
import { PlusCircle, Trash2, ListMusic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PlaylistItem } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(3, "O nome do hino deve ter pelo menos 3 caracteres."),
});

export function CommunityPlaylists() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newHymn: PlaylistItem = {
      id: new Date().getTime().toString(),
      title: values.title,
    };

    setPlaylist((prev) => [...prev, newHymn]);
    form.reset();
    toast({
        title: "Hino Adicionado!",
        description: `"${values.title}" foi adicionado à playlist.`,
    });
  }

  const handleRemoveHymn = (id: string) => {
    setPlaylist(playlist.filter(item => item.id !== id));
    toast({
        title: "Hino Removido",
        description: "O hino foi removido da playlist."
    })
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormLabel>Nome do Hino</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Quão Grande És Tu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">
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
                <h2 className="text-2xl font-semibold">Playlist Vazia</h2>
                <p>O administrador ainda não adicionou hinos a esta playlist.</p>
            </div>
        </div>
      )}
    </div>
  );
}
