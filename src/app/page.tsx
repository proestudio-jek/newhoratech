
import Link from "next/link";
import Image from "next/image";
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
import { ArrowRight, Users, Mic, Music2 } from "lucide-react";

export default function Home() {
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

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Carousel Section */}
      <section className="container -mt-8">
        <Carousel
          className="w-full"
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
              <ArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
