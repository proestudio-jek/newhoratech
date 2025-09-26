"use client";

import { HymnCalendar } from "@/components/hymn-calendar";
import { CommunityVideos } from "@/components/community-videos";
import { CommunityPlaylists } from "@/components/community-playlists";
import { CommunityNews } from "@/components/community-news";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Video, ListMusic, Newspaper } from "lucide-react";

type ContentPageProps = {
  title: string;
  description: string;
};

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
          <HymnCalendar />
        </TabsContent>
        <TabsContent value="videos" className="mt-6">
          <CommunityVideos />
        </TabsContent>
        <TabsContent value="playlists" className="mt-6">
          <CommunityPlaylists />
        </TabsContent>
        <TabsContent value="news" className="mt-6">
          <CommunityNews />
        </TabsContent>
      </Tabs>
    </div>
  );
}
