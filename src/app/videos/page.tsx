"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { PlayCircle } from "lucide-react";

const videos = [
  {
    id: "LF_V_xBk07I",
    title: "Coro Magnificat",
    description: "Uma performance inspiradora do coro da comunidade.",
    hint: "church choir",
  },
  {
    id: "XBNj8Vz958E",
    title: "Hino da Manhã",
    description: "Um louvor para começar o dia com fé.",
    hint: "sunrise worship",
  },
  {
    id: "e-33j_J2m-g",
    title: "Adoração Instrumental",
    description: "Música instrumental para momentos de reflexão.",
    hint: "piano church",
  },
  {
    id: "b2bKa3y0fpc",
    title: "Cânticos de Esperança",
    description: "Uma coleção de cânticos que renovam a esperança.",
    hint: "acoustic guitar",
  },
];

export default function VideosPage() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-4xl font-bold text-primary">
          Galeria de Vídeos
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Assista a performances, clipes e momentos de adoração.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <Card
            key={video.id}
            onClick={() => setSelectedVideo(video.id)}
            className="cursor-pointer overflow-hidden transition-transform hover:scale-105"
          >
            <CardHeader className="p-0 relative group">
              <Image
                src={`https://picsum.photos/400/225?random=${video.id}`}
                data-ai-hint={video.hint}
                alt={video.title}
                width={400}
                height={225}
                className="aspect-video w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayCircle className="h-16 w-16 text-white/80" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg font-bold">{video.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!selectedVideo}
        onOpenChange={(isOpen) => !isOpen && setSelectedVideo(null)}
      >
        <DialogContent className="max-w-4xl p-0">
          <div className="aspect-video">
            {selectedVideo && (
                <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full rounded-lg"
              ></iframe>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
