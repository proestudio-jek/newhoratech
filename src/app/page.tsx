
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
import { ArrowRight, Calendar, Users, Video } from "lucide-react";

export default function Home() {
  const featureSections = [
    {
      title: "Calendário de Hinos",
      description: "Acesse o calendário litúrgico completo e planeje os hinos para cada ocasião especial.",
      href: "/calendar",
      icon: Calendar,
    },
    {
      title: "Galeria de Vídeos",
      description: "Assista a performances, clipes e momentos de adoração em nossa galeria exclusiva.",
      href: "/videos",
      icon: Video,
    },
    {
      title: "Comunidades Musicais",
      description: "Explore e participe de nossas comunidades: Semente da Fé, Louvores de Sião e Grande Coral.",
      href: "/semente-da-fe",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative -mt-8 -mx-8">
        <div className="relative h-[60vh] min-h-[500px] w-full">
          <Image
            src="https://picsum.photos/seed/music-hero/1800/1000"
            alt="Pessoas cantando em um coral"
            data-ai-hint="gospel choir singing"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-transparent" />
        </div>
        <div className="container absolute bottom-0 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 md:top-auto md:translate-y-0 md:bottom-16">
           <div className="max-w-2xl text-center md:text-left">
            <h1 className="font-headline text-5xl md:text-7xl font-black text-primary tracking-tight">
              Sua jornada musical começa aqui.
            </h1>
            <p className="mt-4 text-lg md:text-xl text-foreground/80">
              PROMUSIC é o seu guia definitivo para hinos, louvores e adoração.
              Encontre inspiração diária e conecte-se com sua fé através da
              música.
            </p>
            <div className="mt-8 flex gap-4 justify-center md:justify-start">
              <Link
                href="/signup"
                className={buttonVariants({ size: "lg" })}
              >
                Começar Agora <ArrowRight />
              </Link>
              <Link
                href="#features"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Saber Mais
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container space-y-12">
        <div className="text-center">
          <h2 className="font-headline text-4xl font-bold text-primary">
            Explore a Plataforma
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Tudo o que você precisa para uma experiência de adoração completa.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {featureSections.map((section) => (
            <Card
              key={section.href}
              className="group flex transform flex-col text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <CardHeader className="items-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
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
        <div className="rounded-lg bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 p-12 text-center text-primary-foreground">
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
