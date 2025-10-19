
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import type { Hymn } from "@/lib/types";
import { Music, PlusCircle, Trash2, CalendarHeart } from "lucide-react";
import { HymnSuggestionModal } from "./hymn-suggestion-modal";
import { DayContent as DayPickerDayContent } from "react-day-picker";

const initialHymns: Record<string, Hymn[]> = {
  [format(new Date(), "yyyy-MM-dd")]: [
    {
      id: "1",
      title: "Santo, Santo, Santo",
      musicUrl: "/hymns/holy-holy-holy.mp3",
    },
  ],
};

export function HymnCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [hymns, setHymns] = useState<Record<string, Hymn[]>>(initialHymns);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user, isAdmin } = useAuth();

  const selectedDateStr = date ? format(date, "yyyy-MM-dd") : "";
  const selectedHymns = hymns[selectedDateStr] || [];

  const handleAddHymn = (hymn: Omit<Hymn, "id">) => {
    if (!date) return;
    const newHymn = { ...hymn, id: new Date().getTime().toString() };
    const updatedHymns = { ...hymns };
    if (!updatedHymns[selectedDateStr]) {
      updatedHymns[selectedDateStr] = [];
    }
    updatedHymns[selectedDateStr].push(newHymn);
    setHymns(updatedHymns);
  };

  const handleRemoveHymn = (hymnId: string) => {
    if (!date) return;
    const updatedHymns = { ...hymns };
    updatedHymns[selectedDateStr] = updatedHymns[selectedDateStr].filter(
      (h) => h.id !== hymnId
    );
    if (updatedHymns[selectedDateStr].length === 0) {
      delete updatedHymns[selectedDateStr];
    }
    setHymns(updatedHymns);
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
              className="w-full"
              components={{
                DayContent: (props) => {
                  const dateStr = format(props.date, "yyyy-MM-dd");
                  const hasHymns = hymns[dateStr] && hymns[dateStr].length > 0;
                  return (
                    <div className="relative h-full w-full">
                      <DayPickerDayContent {...props} />
                      {hasHymns && (
                        <div className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-accent"></div>
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarHeart className="text-primary" />
              <span>
                {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedHymns.length > 0 ? (
              <ul className="space-y-3">
                {selectedHymns.map((hymn) => (
                  <li
                    key={hymn.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {hymn.musicUrl && <Music className="h-5 w-5 text-accent" />}
                      <span className="font-medium">{hymn.title}</span>
                    </div>
                    {user && isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveHymn(hymn.id)}
                        aria-label={`Remover ${hymn.title}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>Nenhum hino agendado para este dia.</p>
              </div>
            )}
            {user && isAdmin && date && (
              <Button
                className="w-full"
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
        />
      )}
    </div>
  );
}
