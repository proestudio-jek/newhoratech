
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowRight, Users, Mic, Music2, Youtube, Play, Music } from "lucide-react";

const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-6 mr-2">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.508 17.302c-.216.354-.674.464-1.028.248-2.822-1.724-6.376-2.113-10.558-1.157-.406.094-.814-.158-.908-.564-.094-.406.158-.814.564-.908 4.577-1.047 8.51-.601 11.682 1.339.354.216.464.674.248 1.028zm1.474-3.264c-.272.441-.85.58-1.291.308-3.232-1.987-8.158-2.56-11.979-1.399-.496.151-1.02-.129-1.171-.625-.151-.496.129-1.02.625-1.171 4.38-1.33 9.805-.688 13.51 1.586.441.272.58.85.308 1.291zm.126-3.4c-3.877-2.302-10.283-2.515-14.01-1.383-.595.181-1.226-.16-1.407-.755-.181-.595.16-1.226.755-1.407 4.285-1.3 11.353-1.05 15.82 1.604.536.319.711 1.01.392 1.546-.319.536-1.01.711-1.546.392z"/>
  </svg>
);

export default function Home() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  const communitySections = [
    {
      title: "Semente da Fé",
      description: "Hinos, calendários e notícias do conjunto Semente da Fé.",
      href: "/semente-da-fe",
      icon: Music2,
      gradient: "from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50",
      bannerGradient: "from-blue-500 to-indigo-600",
    },
    {
      title: "Louvores de Sião",
      description: "Explore os louvores e eventos de Sião.",
      href: "/louvores-de-siao",
      icon: Users,
      gradient: "from-sky-100 to-cyan-100 dark:from-sky-900/50 dark:to-cyan-900/50",
      bannerGradient: "from-sky-500 to-cyan-600",
    },
    {
      title: "Grande Coral",
      description: "Apresentações e repertório do Grande Coral.",
      href: "/grande-coral",
      icon: Mic,
      gradient: "from-purple-100 to-violet-100 dark:from-purple-900/50 dark:to-violet-900/50",
      bannerGradient: "from-purple-500 to-violet-600",
    },
  ];

  const externalPlaylists = [
    {
      title: "Spotify",
      label: "Ouvir no Spotify",
      icon: SpotifyIcon,
      href: "https://spotify.com",
      color: "bg-[#1DB954] hover:bg-[#1ed760] text-white",
    },
    {
      title: "YouTube",
      label: "Assista no YouTube",
      icon: Youtube,
      href: "https://youtube.com",
      color: "bg-[#FF0000] hover:bg-[#cc0000] text-white",
    },
    {
      title: "YouTube Music",
      label: "YouTube Music",
      icon: Music,
      href: "https://music.youtube.com",
      color: "bg-[#212121] hover:bg-black text-white",
    },
  ];

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Carousel Section */}
      <section className="container -mt-8">
        <Carousel
          className="w-full"
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            {communitySections.map((community, index) => (
              <CarouselItem key={index}>
                <Link href={community.href}>
                  <div className="p-1">
                    <Card className="overflow-hidden relative group">
                      <CardContent className="p-0">
                        <div
                          className={`relative w-full aspect-video md:aspect-[2.4/1] flex flex-col items-center justify-center p-8 transition-all duration-500 bg-gradient-to-br ${community.bannerGradient} group-hover:opacity-90`}
                        >
                          <div className="relative z-10 text-center text-white">
                            <community.icon className="size-12 md:size-16 mx-auto mb-4" />
                            <h3 className="font-headline text-4xl md:text-6xl font-bold tracking-tight">
                              {community.title}
                            </h3>
                             <p className="mt-2 text-lg md:text-xl opacity-90 max-w-2xl mx-auto">{community.description}</p>
                             <div className={buttonVariants({ variant: 'link', className: 'text-white/80 group-hover:text-white mt-4 text-lg'})}>
                                Acessar <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                             </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </section>

      {/* Communities Section */}
      <section id="communities" className="container space-y-12">
        <div className="text-center">
          <h2 className="font-headline text-4xl font-bold text-primary">
            Nossos Conjuntos
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Explore o conteúdo exclusivo de cada grupo musical.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {communitySections.map((section) => (
            <Card
              key={section.href}
              className={`group flex transform flex-col text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl bg-gradient-to-br ${section.gradient}`}
            >
              <CardHeader className="items-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-white/50 dark:bg-black/20 text-primary">
                  <section.icon className="size-8" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-grow flex-col gap-4">
                <CardTitle className="text-2xl text-primary">
                  {section.title}
                </CardTitle>
                <CardDescription className="flex-grow text-base text-foreground/70">
                  {section.description}
                </CardDescription>
                <Link
                  href={section.href}
                  className={buttonVariants({
                    variant: "link",
                    className: "group-hover:text-primary",
                  })}
                >
                  Acessar <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* External Playlists Section */}
      <section className="container space-y-12">
        <div className="text-center">
          <h2 className="font-headline text-4xl font-bold text-primary">
            Ouça nossas Playlists
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Acompanhe nossos louvores em sua plataforma favorita.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {externalPlaylists.map((playlist) => (
            <a
              key={playlist.title}
              href={playlist.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center justify-center gap-2 p-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md font-bold text-lg",
                playlist.color
              )}
            >
              <playlist.icon className="size-7" />
              {playlist.label}
            </a>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container">
        <div className="rounded-lg bg-gradient-to-r from-primary via-blue-500 to-indigo-500 p-12 text-center text-primary-foreground">
          <h2 className="font-headline text-4xl font-bold">
            Junte-se à Comunidade PROMUSIC
          </h2>
          <p className="mt-4 text-lg opacity-90">
            Crie sua conta gratuita e comece a explorar um universo de música e
            adoração hoje mesmo.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className={buttonVariants({
                size: "lg",
                variant: "secondary",
                className: "bg-white/90 hover:bg-white text-primary",
              })}
            >
              Criar Conta Grátis
              <ArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
