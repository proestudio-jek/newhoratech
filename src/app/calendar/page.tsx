import { HymnCalendar } from "@/components/hymn-calendar";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-4xl font-bold text-primary">
          Calendário de Hinos
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Selecione uma data para ver o hino do dia. No modo admin, você pode
          adicionar ou remover hinos.
        </p>
      </header>
      <HymnCalendar />
    </div>
  );
}
