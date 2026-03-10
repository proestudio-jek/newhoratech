
"use client";

import { HymnCalendar } from "@/components/hymn-calendar";
import { CommunityVideos } from "@/components/community-videos";
import { CommunityPlaylists } from "@/components/community-playlists";
import { CommunityNews } from "@/components/community-news";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Video, ListMusic, Newspaper, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

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
  colorTheme?: {
    primary: string; // HSL value e.g. "221 83% 53%"
    accent: string;
    gradient: string; // Tailwind class e.g. "from-blue-600 to-indigo-700"
  };
};

export function ContentPage({ title, description, extraTabs = [], colorTheme }: ContentPageProps) {
  const totalTabs = 4 + extraTabs.length;

  // Estilos inline para sobrepor as cores primárias do tema global apenas nesta página
  const dynamicStyles = colorTheme ? {
    "--primary": colorTheme.primary,
    "--ring": colorTheme.primary,
    "--accent": colorTheme.accent,
  } as React.CSSProperties : {};

  return (
    <div className="space-y-6" style={dynamicStyles}>
      <header className={cn(
        "relative overflow-hidden rounded-2xl p-8 text-white shadow-lg transition-all duration-500",
        colorTheme ? `bg-gradient-to-r ${colorTheme.gradient}` : "bg-primary"
      )}>
        <div className="relative z-10">
          <h1 className="font-headline text-3xl sm:text-5xl font-bold">
            {title}
          </h1>
          <p className="mt-4 text-base sm:text-xl text-white/90 max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>
        {/* Elemento decorativo de fundo */}
        <div className="absolute -right-10 -bottom-10 opacity-10">
           <Newspaper className="h-64 w-64 rotate-12" />
        </div>
      </header>

      <Tabs defaultValue="calendar" className="w-full">
        <div className="overflow-x-auto pb-2 sm:pb-0">
          <TabsList className={cn(
              "flex w-full min-w-max sm:grid h-auto p-1 bg-muted/50 rounded-xl border border-primary/10",
              totalTabs === 4 ? "sm:grid-cols-4" : totalTabs === 5 ? "sm:grid-cols-5" : "sm:grid-cols-6"
          )}>
            <TabsTrigger value="calendar" className="flex-1 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary transition-all">
              <Calendar className="mr-2 h-4 w-4" />
              <span className="font-semibold">Calendário</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex-1 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary transition-all">
              <Video className="mr-2 h-4 w-4" />
              <span className="font-semibold">Vídeos</span>
            </TabsTrigger>
            <TabsTrigger value="playlists" className="flex-1 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary transition-all">
              <ListMusic className="mr-2 h-4 w-4" />
              <span className="font-semibold">Playlists</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex-1 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary transition-all">
              <Newspaper className="mr-2 h-4 w-4" />
              <span className="font-semibold">Notícias</span>
            </TabsTrigger>
            {extraTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-1 py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary transition-all">
                <tab.icon className="mr-2 h-4 w-4" />
                <span className="font-semibold">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        <TabsContent value="calendar" className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <HymnCalendar targetConjunto={title} />
        </TabsContent>
        <TabsContent value="videos" className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CommunityVideos targetConjunto={title} />
        </TabsContent>
        <TabsContent value="playlists" className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CommunityPlaylists targetConjunto={title} />
        </TabsContent>
        <TabsContent value="news" className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CommunityNews targetConjunto={title} />
        </TabsContent>
        {extraTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
