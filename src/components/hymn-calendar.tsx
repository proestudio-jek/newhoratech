
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { collection, query, doc, serverTimestamp, Timestamp, where } from "firebase/firestore";
import { Music, PlusCircle, Trash2, CalendarHeart, Loader2, BookmarkCheck, Star, Save, CalendarPlus, Edit, Info, Sparkles } from "lucide-react";
import { HymnSuggestionModal } from "./hymn-suggestion-modal";
import { DayContent as DayPickerDayContent } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { CalendarEntry, CalendarEvent, Hymn } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HymnCalendarProps {
  targetConjunto?: string;
}

export function HymnCalendar({ targetConjunto }: HymnCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const { user, isAdmin } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    setDate(new Date());
  }, []);

  const calendarColRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "calendarEntries");
  }, [db]);

  const eventsColRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "calendarEvents");
  }, [db]);

  const calendarQuery = useMemoFirebase(() => {
    if (!calendarColRef) return null;
    if (targetConjunto) {
      return query(calendarColRef, where("conjunto", "==", targetConjunto));
    }
    return query(calendarColRef);
  }, [calendarColRef, targetConjunto]);

  const eventsQuery = useMemoFirebase(() => {
    if (!eventsColRef) return null;
    if (targetConjunto) {
      return query(eventsColRef, where("conjunto", "==", targetConjunto));
    }
    return query(eventsColRef);
  }, [eventsColRef, targetConjunto]);

  const { data: allEntries, isLoading: loadingEntries } = useCollection<CalendarEntry>(calendarQuery);
  const { data: allEvents, isLoading: loadingEvents } = useCollection<CalendarEvent>(eventsQuery);

  const selectedDateStr = date ? format(date, "yyyy-MM-dd") : "";
  
  const selectedHymns = allEntries?.filter(entry => {
    if (!entry.date) return false;
    const entryDate = entry.date instanceof Timestamp ? entry.date.toDate() : new Date(entry.date);
    return format(entryDate, "yyyy-MM-dd") === selectedDateStr;
  }) || [];

  const selectedEvent = allEvents?.find(event => {
    if (!event.date) return false;
    const eventDate = event.date instanceof Timestamp ? event.date.toDate() : new Date(event.date);
    return format(eventDate, "yyyy-MM-dd") === selectedDateStr;
  });

  useEffect(() => {
    setEventTitle(selectedEvent?.title || "");
  }, [selectedEvent, date]);

  const handleSaveEvent = async () => {
    if (!date || !db || !eventsColRef || !isAdmin) return;
    
    setIsSavingEvent(true);
    const eventId = targetConjunto 
      ? `event-${targetConjunto}-${selectedDateStr}` 
      : `event-global-${selectedDateStr}`;
    
    const docRef = doc(db, "calendarEvents", eventId);
    
    const eventData = {
      title: eventTitle,
      date: Timestamp.fromDate(date),
      conjunto: targetConjunto || "Geral",
      createdAt: serverTimestamp(),
    };

    try {
      setDocumentNonBlocking(docRef, eventData, { merge: true });
      toast({
        title: "Evento Salvo",
        description: `O evento para ${format(date, "dd/MM")} foi atualizado com sucesso.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um problema ao tentar salvar o evento."
      });
    } finally {
      setIsSavingEvent(false);
    }
  };

  const handleAddHymn = (hymn: Omit<Hymn, "id">) => {
    if (!date || !calendarColRef) return;
    
    const newEntry = {
      hymnTitle: hymn.title,
      musicUrl: hymn.musicUrl || "",
      date: Timestamp.fromDate(date),
      hymnId: `manual-${Date.now()}`,
      conjunto: targetConjunto || "Geral",
      createdAt: serverTimestamp(),
    };

    addDocumentNonBlocking(calendarColRef, newEntry);
  };

  const handleRemoveHymn = (entryId: string) => {
    if (!db) return;
    const docRef = doc(db, "calendarEntries", entryId);
    deleteDocumentNonBlocking(docRef);
  };

  if (loadingEntries || loadingEvents) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
      {/* Calendário Principal */}
      <div className="md:col-span-7">
        <Card className="overflow-hidden shadow-lg border-primary/10">
           <CardHeader className="bg-primary/5 pb-4">
             <CardTitle className="text-xl flex items-center gap-2">
               <BookmarkCheck className="h-5 w-5 text-primary" />
               {targetConjunto ? `Calendário - ${targetConjunto}` : "Calendário Central de Hinos"}
             </CardTitle>
             <CardDescription>
               Clique em um dia para ver os eventos e a escala de hinos.
             </CardDescription>
           </CardHeader>
          <CardContent className="p-0 sm:p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
              className="w-full flex justify-center"
              components={{
                DayContent: (props) => {
                  const dateStr = format(props.date, "yyyy-MM-dd");
                  const hasHymns = allEntries?.some(entry => {
                    const entryDate = entry.date instanceof Timestamp ? entry.date.toDate() : new Date(entry.date);
                    return format(entryDate, "yyyy-MM-dd") === dateStr;
                  });
                  const hasEvent = allEvents?.some(event => {
                    const eventDate = event.date instanceof Timestamp ? event.date.toDate() : new Date(event.date);
                    return format(eventDate, "yyyy-MM-dd") === dateStr;
                  });
                  return (
                    <div className="relative h-full w-full flex items-center justify-center">
                      <DayPickerDayContent {...props} />
                      {(hasHymns || hasEvent) && (
                        <div className={cn(
                          "absolute bottom-1 h-1.5 w-1.5 rounded-full animate-pulse",
                          hasEvent ? 'bg-amber-500' : 'bg-primary'
                        )}></div>
                      )}
                    </div>
                  );
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Painel de Detalhes (Evento e Hinos) - Sempre visível para todos */}
      <div className="md:col-span-5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <Card className="shadow-md border-primary/20 bg-white overflow-hidden h-full">
          <CardHeader className="bg-primary text-primary-foreground py-4">
            <div className="flex items-center gap-3">
              <CalendarHeart className="h-6 w-6" />
              <div>
                <CardTitle className="text-lg sm:text-xl">
                  {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            
            {/* Seção do Evento do Dia - Visível para todos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-sm uppercase tracking-wider">
                  <Star className="h-4 w-4 fill-amber-600" /> Evento Especial
                </div>
                {isAdmin && (
                  <Badge variant="outline" className="text-[10px] bg-amber-50 border-amber-200 text-amber-600">
                    Modo Editor
                  </Badge>
                )}
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 shadow-sm min-h-[80px] flex flex-col items-center justify-center text-center transition-all">
                {selectedEvent?.title ? (
                  <div className="space-y-1">
                    <span className="text-amber-900 font-black text-xl leading-tight block">
                      {selectedEvent.title}
                    </span>
                    {!targetConjunto && selectedEvent.conjunto && (
                      <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                        {selectedEvent.conjunto}
                      </Badge>
                    )}
                  </div>
                ) : !isAdmin && (
                  <span className="text-amber-700/40 italic text-sm">Não há um evento especial registrado.</span>
                )}

                {isAdmin && (
                  <div className="mt-4 flex gap-2 w-full">
                    <Input 
                      placeholder="Editar nome do evento..." 
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="h-10 text-sm bg-white border-amber-200 focus-visible:ring-amber-500"
                    />
                    <Button 
                      size="icon" 
                      onClick={handleSaveEvent} 
                      disabled={isSavingEvent}
                      className="bg-amber-500 hover:bg-amber-600 shrink-0 shadow-md"
                    >
                      {isSavingEvent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-5 w-5" />}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Seção da Escala de Hinos - Visível para todos */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                  <Music className="h-4 w-4" /> Escala de Hinos
                </div>
              </div>

              {selectedHymns.length > 0 ? (
                <div className="space-y-3">
                  {selectedHymns.map((hymn) => (
                    <div
                      key={hymn.id}
                      className="flex flex-col gap-2 rounded-xl border p-4 bg-muted/5 hover:bg-muted/10 transition-all shadow-sm relative group border-l-4 border-l-primary"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                             <div className="p-1.5 bg-primary/10 rounded-full">
                               <Music className="h-4 w-4 text-primary" />
                             </div>
                             <span className="font-bold text-sm sm:text-base text-foreground truncate">{hymn.hymnTitle}</span>
                          </div>
                          {!targetConjunto && hymn.conjunto && (
                            <div className="mt-2 flex items-center gap-2">
                              <Badge variant="secondary" className="text-[10px] py-0 px-2 h-5 font-bold tracking-wider uppercase">
                                {hymn.conjunto}
                              </Badge>
                            </div>
                          )}
                        </div>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveHymn(hymn.id)}
                            className="text-destructive hover:bg-destructive/10 shrink-0 h-9 w-9 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-10 px-4 border-2 border-dashed rounded-xl bg-muted/5">
                  <Music className="mx-auto h-12 w-12 opacity-10 mb-3" />
                  <p className="text-sm">Ainda não há hinos agendados.</p>
                </div>
              )}
              
              {isAdmin && date && (
                <div className="pt-4">
                   <Button
                    className="w-full shadow-md h-12 text-md font-bold transition-all active:scale-95 bg-primary hover:bg-primary/90"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <CalendarPlus className="mr-2 h-5 w-5" />
                    Gerenciar Escala
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {isAdmin && date && (
        <HymnSuggestionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          date={date}
          onHymnAdd={handleAddHymn}
          targetConjunto={targetConjunto}
        />
      )}
    </div>
  );
}
