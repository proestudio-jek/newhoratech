import Image from "next/image";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function Home() {
  const carouselImages = [
    {
      src: "https://picsum.photos/1200/600",
      alt: "Stained glass window in a church",
      hint: "church stained_glass"
    },
    {
      src: "https://picsum.photos/1200/600",
      alt: "A choir singing in a church",
      hint: "gospel choir"
    },
    {
      src: "https://picsum.photos/1200/600",
      alt: "An open hymnal on a piano",
      hint: "hymnal piano"
    },
    {
      src: "https://picsum.photos/1200/600",
      alt: "Sunlight streaming through a forest",
      hint: "sunlight forest"
    },
  ];

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="font-headline text-5xl md:text-7xl font-black text-primary tracking-tight">
          Bem-vindo à Semente da Fé
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
                      src={image.src}
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
    </div>
  );
}
