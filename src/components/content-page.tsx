
"use client";

import { HymnCalendar } from "@/components/hymn-calendar";
import { CommunityVideos } from "@/components/community-videos";
import { CommunityPlaylists } from "@/components/community-playlists";
import { CommunityNews } from "@/components/community-news";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Video, ListMusic, Newspaper, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const totalTabs = 4 + extraTabs.length;

  return (
    <div className="space-y-6">
      <header className="border-b pb-4">
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-primary">
          {title}
        </h1>
        <p className="mt-2 text-base sm:text-lg text-muted-foreground">{description}</p>
      </header>

      <Tabs defaultValue="calendar" className="w-full">
        <div className="overflow-x-auto pb-2 sm:pb-0">
          <TabsList className={cn(
              "flex w-full min-w-max sm:grid h-auto p-1 bg-muted/50 rounded-xl",
              totalTabs === 4 ? "sm:grid-cols-4" : totalTabs === 5 ? "sm:grid-cols-5" : "sm:grid-cols-6"
          )}>
            <TabsTrigger value="calendar" className="flex-1 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Calendar className="mr-2 h-4 w-4" />
              <span className="inline">Calendário</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex-1 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Video className="mr-2 h-4 w-4" />
              <span className="inline">Vídeos</span>
            </TabsTrigger>
            <TabsTrigger value="playlists" className="flex-1 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <ListMusic className="mr-2 h-4 w-4" />
              <span className="inline">Playlists</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex-1 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Newspaper className="mr-2 h-4 w-4" />
              <span className="inline">Notícias</span>
            </TabsTrigger>
            {extraTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-1 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <tab.icon className="mr-2 h-4 w-4" />
                <span className="inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        <TabsContent value="calendar" className="mt-6">
          <HymnCalendar targetConjunto={title} />
        </TabsContent>
        <TabsContent value="videos" className="mt-6">
          <CommunityVideos targetConjunto={title} />
        </TabsContent>
        <TabsContent value="playlists" className="mt-6">
          <CommunityPlaylists targetConjunto={title} />
        </TabsContent>
        <TabsContent value="news" className="mt-6">
          <CommunityNews targetConjunto={title} />
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
