"use client";

import { HymnCalendar } from "@/components/hymn-calendar";
import VideosPage from "@/app/videos/page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Video, ListMusic, Newspaper } from "lucide-react";

type ContentPageProps = {
  title: string;
  description: string;
};

const PlaceholderContent = ({ title }: { title: string }) => (
    <div className="flex items-center justify-center h-96 rounded-lg border-2 border-dashed">
        <div className="text-center text-muted-foreground">
            <h2 className="text-2xl font-semibold">Conteúdo de {title}</h2>
            <p>Esta área será implementada em breve.</p>
        </div>
    </div>
);


export function ContentPage({ title, description }: ContentPageProps) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-4xl font-bold text-primary">
          {title}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">{description}</p>
      </header>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar">
            <Calendar className="mr-2" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Video className="mr-2" />
            Vídeos
          </TabsTrigger>
          <TabsTrigger value="playlists">
            <ListMusic className="mr-2" />
            Playlists
          </TabsTrigger>
          <TabsTrigger value="news">
            <Newspaper className="mr-2" />
            Notícias
          </TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="mt-6">
           {/* O calendário está sendo reutilizado aqui, mas idealmente teria seus próprios dados */}
          <HymnCalendar />
        </TabsContent>
        <TabsContent value="videos" className="mt-6">
           {/* A página de vídeos está sendo reutilizada aqui, mas idealmente teria seus próprios dados */}
           <div className="space-y-6">
             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {/* Conteúdo de vídeo viria aqui */}
             </div>
           </div>
           <PlaceholderContent title="Vídeos" />
        </TabsContent>
        <TabsContent value="playlists" className="mt-6">
            <PlaceholderContent title="Playlists" />
        </TabsContent>
        <TabsContent value="news" className="mt-6">
            <PlaceholderContent title="Notícias" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
