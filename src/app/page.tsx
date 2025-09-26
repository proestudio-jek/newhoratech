import Image from "next/image";
import Link from "next/link";
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
import { ArrowRight, Music, Users, Mic } from "lucide-react";

export default function Home() {
  const carouselImages = [
    {
      src: "https://picsum.photos/seed/1/1200/600",
      alt: "Stained glass window in a church",
      hint: "church stained_glass"
    },
    {
      src: "https://picsum.photos/seed/2/1200/600",
      alt: "A choir singing in a church",
      hint: "gospel choir"
    },
    {
      src: "https://picsum.photos/seed/3/1200/600",
      alt: "An open hymnal on a piano",
      hint: "hymnal piano"
    },
    {
      src: "https://picsum.photos/seed/4/1200/600",
      alt: "Sunlight streaming through a forest",
      hint: "sunlight forest"
    },
  ];

  const sections = [
    {
      title: "Semente da Fé",
      description: "Hinos, calendários e notícias da Semente da Fé.",
      href: "/semente-da-fe",
      icon: Music,
    },
    {
      title: "Louvores de Sião",
      description: "Explore os louvores e eventos de Sião.",
      href: "/louvores-de-siao",
      icon: Users,
    },
    {
      title: "Grande Coral",
      description: "Apresentações e repertório do Grande Coral.",
      href: "/grande-coral",
      icon: Mic,
    },
  ];

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="font-headline text-5xl md:text-7xl font-black text-primary tracking-tight">
          Bem-vindo à PROMUSIC
        </h1>
        <p className="mt-4 text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
          Seu recurso diário para hinos e louvores que inspiram a alma. Explore nosso calendário litúrgico e enriqueça sua adoração.
        </p>
      </section>

      <section>
        <Carousel 
          className="w-full max-w-5xl mx-auto" 
          opts={{ loop: true }}
        >
          <CarouselContent>
            {carouselImages.map((image, index) => (
              <CarouselItem key={index}>
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <Image
                      src={image.src.replace(/seed\/\d+\//, `seed/${index + 1}/`)}
                      alt={image.alt}
                      data-ai-hint={image.hint}
                      width={1200}
                      height={600}
                      className="w-full h-auto object-cover aspect-video"
                    />
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="ml-16" />
          <CarouselNext className="mr-16" />
        </Carousel>
      </section>

      <section className="space-y-6">
          <div className="text-center">
            <h2 className="font-headline text-4xl font-bold text-primary">Nossas Comunidades</h2>
            <p className="mt-2 text-lg text-muted-foreground">Explore o conteúdo de cada grupo.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sections.map((section) => (
              <Card key={section.href} className="flex flex-col group hover:border-primary transition-colors">
                <CardHeader className="flex-row items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <section.icon className="size-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex items-end justify-end">
                  <Link href={section.href} className="text-sm font-semibold text-primary inline-flex items-center gap-1 group-hover:underline">
                    Ver mais <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
      </section>
    </div>
  );
}
