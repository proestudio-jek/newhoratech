
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Hymn } from "@/lib/types";
import { suggestHymnsForDate } from "@/ai/flows/suggest-hymns-for-date";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestore, addDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, Timestamp } from "firebase/firestore";

const formSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
  musicUrl: z.string().url("Deve ser uma URL válida.").optional().or(z.literal("")),
});

const suggestionSchema = z.object({
  liturgicalInfo: z.string().min(5, "Forneça mais detalhes litúrgicos."),
});

type HymnSuggestionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  onHymnAdd: (hymn: Omit<Hymn, "id">) => void;
};

export function HymnSuggestionModal({ isOpen, onClose, date, onHymnAdd }: HymnSuggestionModalProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const db = useFirestore();

  const calendarColRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "calendarEntries");
  }, [db]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", musicUrl: "" },
  });

  const suggestionForm = useForm<z.infer<typeof suggestionSchema>>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: { liturgicalInfo: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!calendarColRef) return;

    const newEntry = {
      hymnTitle: values.title,
      musicUrl: values.musicUrl || "",
      date: Timestamp.fromDate(date),
      hymnId: `manual-${Date.now()}`,
      createdAt: serverTimestamp(),
    };

    addDocumentNonBlocking(calendarColRef, newEntry);
    form.reset();
    onClose();
    toast({
      title: "Hino Adicionado!",
      description: `"${values.title}" foi agendado para ${format(date, "PPP", { locale: ptBR })}.`,
    });
  }

  async function onSuggest(values: z.infer<typeof suggestionSchema>) {
    setIsLoading(true);
    setSuggestions([]);
    try {
      const result = await suggestHymnsForDate({
        date: format(date, "yyyy-MM-dd"),
        liturgicalCalendarInfo: values.liturgicalInfo,
      });
      setSuggestions(result.hymnSuggestions);
    } catch (error) {
      console.error("Error suggesting hymns:", error);
      toast({
        variant: "destructive",
        title: "Erro na Sugestão",
        description: "Não foi possível obter sugestões. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleUseSuggestion = (suggestion: string) => {
    form.setValue("title", suggestion);
    setSuggestions([]);
    suggestionForm.reset();
  };
  
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Adicionar Hino</DialogTitle>
          <DialogDescription>
            Agende um hino para {format(date, "PPP", { locale: ptBR })}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Form {...suggestionForm}>
            <form onSubmit={suggestionForm.handleSubmit(onSuggest)} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                 <Wand2 className="h-5 w-5 text-primary" />
                 <h3 className="font-semibold">Assistente de Hinos IA</h3>
              </div>
              <p className="text-sm text-muted-foreground">Descreva o contexto litúrgico (ex: "Domingo de Páscoa") e receba sugestões de hinos.</p>
              <FormField
                control={suggestionForm.control}
                name="liturgicalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Informação Litúrgica</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: Terceiro Domingo do Advento, Festa de Pentecostes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Sugerir Hinos
              </Button>

              {suggestions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-sm font-medium">Sugestões:</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s, i) => (
                      <Button key={i} variant="outline" size="sm" onClick={() => handleUseSuggestion(s)}>
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </Form>

          <Separator />
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <h3 className="font-semibold">Adicionar Manualmente</h3>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Hino</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Quão Grande És Tu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="musicUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Música (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/hymn.mp3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <DialogFooter>
                  <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                  <Button type="submit">Salvar Hino</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
