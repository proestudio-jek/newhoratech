
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { collection, query, doc, serverTimestamp, Timestamp, where } from "firebase/firestore";
import type { CalendarEntry, CalendarEvent, Hymn } from "@/lib/types";
import { Music, PlusCircle, Trash2, CalendarHeart, Loader2, BookmarkCheck, Star, Edit3, Save } from "lucide-react";
import { HymnSuggestionModal } from "./hymn-suggestion-modal";
import { DayContent as DayPickerDayContent } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface HymnCalendarProps {
  targetConjunto?: string;
}

export function HymnCalendar({ targetConjunto }: HymnCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
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

  const handleSaveEvent = () => {
    if (!date || !db || !eventsColRef) return;
    
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

    setDocumentNonBlocking(docRef, eventData, { merge: true });
    toast({
      title: "Evento Atualizado",
      description: `O nome do evento para ${format(date, "dd/MM")} foi salvo.`
    });
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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card className="overflow-hidden shadow-lg border-primary/10">
           <CardHeader className="bg-primary/5 pb-4">
             <CardTitle className="text-xl flex items-center gap-2">
               <BookmarkCheck className="h-5 w-5 text-primary" />
               {targetConjunto ? `Calendário - ${targetConjunto}` : "Calendário Central de Hinos"}
             </CardTitle>
             <CardDescription>
               {targetConjunto 
                 ? `Visualize as escalas específicas do conjunto ${targetConjunto}.` 
                 : "Consolidado de todas as escalas e apresentações de todos os conjuntos."}
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
                        <div className={`absolute bottom-1 h-1.5 w-1.5 rounded-full animate-pulse ${hasEvent ? 'bg-amber-500' : 'bg-primary'}`}></div>
                      )}
                    </div>
                  );
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-1">
        <Card className="sticky top-20 shadow-md border-primary/20 bg-white">
          <CardHeader className="pb-3 border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-primary">
              <CalendarHeart className="h-5 w-5" />
              <span className="text-base sm:text-lg">
                {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            
            {/* Seção do Evento do Dia */}
            <div className="space-y-3 pb-2">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm uppercase tracking-wider">
                <Star className="h-4 w-4 fill-amber-600" /> Evento do Dia
              </div>
              {isAdmin ? (
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ex: Culto de Jovens..." 
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Button size="sm" variant="secondary" onClick={handleSaveEvent} title="Salvar Evento">
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              ) : selectedEvent?.title ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 font-semibold shadow-sm animate-in fade-in zoom-in duration-300">
                  {selectedEvent.title}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Nenhum evento especial registrado.</p>
              )}
            </div>

            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider mt-4">
              <Music className="h-4 w-4" /> Escala de Hinos
            </div>

            {selectedHymns.length > 0 ? (
              <ul className="space-y-3">
                {selectedHymns.map((hymn) => (
                  <li
                    key={hymn.id}
                    className="flex flex-col gap-2 rounded-lg border p-3 bg-muted/10 hover:bg-muted/20 transition-colors relative group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                           <Music className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                           <span className="font-bold text-sm sm:text-base text-foreground truncate">{hymn.hymnTitle}</span>
                        </div>
                        {!targetConjunto && hymn.conjunto && (
                          <Badge variant="outline" className="mt-1 w-fit bg-primary/5 text-[10px] py-0 px-2 h-5 border-primary/20 text-primary uppercase font-bold tracking-wider">
                            {hymn.conjunto}
                          </Badge>
                        )}
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => handleRemoveHymn(hymn.id)}
                          className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-colors flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                          aria-label={`Remover ${hymn.hymnTitle}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-muted-foreground py-10 px-4 border-2 border-dashed rounded-xl">
                <Music className="mx-auto h-8 w-8 opacity-10 mb-2" />
                <p className="text-xs">Nenhum hino agendado.</p>
              </div>
            )}
            {isAdmin && date && (
              <Button
                className="w-full shadow-sm mt-2"
                onClick={() => setIsModalOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Agendar Hino
              </Button>
            )}
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
