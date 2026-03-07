
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase";
import { collection, query, doc, serverTimestamp, Timestamp, where } from "firebase/firestore";
import type { CalendarEntry, Hymn } from "@/lib/types";
import { Music, PlusCircle, Trash2, CalendarHeart, Loader2 } from "lucide-react";
import { HymnSuggestionModal } from "./hymn-suggestion-modal";
import { DayContent as DayPickerDayContent } from "react-day-picker";

interface HymnCalendarProps {
  targetConjunto?: string;
}

export function HymnCalendar({ targetConjunto }: HymnCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const db = useFirestore();

  const calendarColRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "calendarEntries");
  }, [db]);

  const calendarQuery = useMemoFirebase(() => {
    if (!calendarColRef) return null;
    // Isolation by conjunto is critical here
    if (targetConjunto) {
      return query(calendarColRef, where("conjunto", "==", targetConjunto));
    }
    return query(calendarColRef);
  }, [calendarColRef, targetConjunto]);

  const { data: allEntries, isLoading } = useCollection<CalendarEntry>(calendarQuery);

  const selectedDateStr = date ? format(date, "yyyy-MM-dd") : "";
  
  const selectedHymns = allEntries?.filter(entry => {
    if (!entry.date) return false;
    const entryDate = entry.date instanceof Timestamp ? entry.date.toDate() : new Date(entry.date);
    return format(entryDate, "yyyy-MM-dd") === selectedDateStr;
  }) || [];

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

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card className="overflow-hidden">
          <CardContent className="p-0 sm:p-2">
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
                  return (
                    <div className="relative h-full w-full flex items-center justify-center">
                      <DayPickerDayContent {...props} />
                      {hasHymns && (
                        <div className="absolute bottom-1 h-1 w-1 rounded-full bg-primary"></div>
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
        <Card className="sticky top-20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary">
              <CalendarHeart className="h-5 w-5" />
              <span className="text-base sm:text-lg truncate">
                {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedHymns.length > 0 ? (
              <ul className="space-y-2">
                {selectedHymns.map((hymn) => (
                  <li
                    key={hymn.id}
                    className="flex items-center justify-between rounded-md border p-3 bg-muted/20"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {hymn.musicUrl && <Music className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                      <span className="font-medium text-xs sm:text-sm truncate">{hymn.hymnTitle}</span>
                    </div>
                    {user && isAdmin && (
                      <button
                        onClick={() => handleRemoveHymn(hymn.id)}
                        className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-colors flex-shrink-0"
                        aria-label={`Remover ${hymn.hymnTitle}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-muted-foreground py-10 px-4">
                <p className="text-xs sm:text-sm">Nenhum hino agendado para este dia.</p>
              </div>
            )}
            {user && isAdmin && date && (
              <Button
                className="w-full text-xs sm:text-sm"
                onClick={() => setIsModalOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Hino
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      {user && isAdmin && date && (
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
