
"use client";

import { HymnCalendar } from "@/components/hymn-calendar";
import { CommunityVideos } from "@/components/community-videos";
import { CommunityPlaylists } from "@/components/community-playlists";
import { CommunityNews } from "@/components/community-news";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Video, ListMusic, Newspaper, LucideIcon } from "lucide-react";

export type CustomTab = {
  value: string;
  label: string;
  icon: LucideIcon;
  content: React.ReactNode;
};

type ContentPageProps = {
  title: string;
  description: string;
  extraTabs?: CustomTab[];
};

export function ContentPage({ title, description, extraTabs = [] }: ContentPageProps) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-4xl font-bold text-primary">
          {title}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">{description}</p>
      </header>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className={`grid w-full grid-cols-${4 + extraTabs.length}`}>
          <TabsTrigger value="calendar">
            <Calendar className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Calendário</span>
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Video className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Vídeos</span>
          </TabsTrigger>
          <TabsTrigger value="playlists">
            <ListMusic className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Playlists</span>
          </TabsTrigger>
          <TabsTrigger value="news">
            <Newspaper className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Notícias</span>
          </TabsTrigger>
          {extraTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              <tab.icon className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
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
        {extraTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-6">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
