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
  const carouselBanners = [
    {
      title: "Semente da Fé",
      href: "/semente-da-fe",
      gradient: "bg-gradient-to-br from-purple-500 to-indigo-600",
    },
    {
      title: "Louvores de Sião",
      href: "/louvores-de-siao",
      gradient: "bg-gradient-to-br from-pink-500 to-purple-600",
    },
    {
      title: "Grande Coral",
      href: "/grande-coral",
      gradient: "bg-gradient-to-br from-fuchsia-500 to-pink-600",
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

      <section>
        <Carousel 
          className="w-full max-w-5xl mx-auto" 
          opts={{ loop: true }}
        >
          <CarouselContent>
            {carouselBanners.map((banner, index) => (
              <CarouselItem key={index}>
                 <Link href={banner.href}>
                    <Card className="overflow-hidden relative group">
                      <CardContent className="p-0">
                        <div
                          className={`w-full aspect-video flex flex-col justify-end p-8 transition-all duration-500 group-hover:brightness-110 ${banner.gradient}`}
                        >
                          <h3 className="font-headline text-4xl md:text-5xl font-bold text-white tracking-tight">
                            {banner.title}
                          </h3>
                        </div>
                      </CardContent>
                    </Card>
                 </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="ml-16" />
          <CarouselNext className="mr-16" />
        </Carousel>
      </section>
    </div>
  );
}
