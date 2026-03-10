
"use client";

import { ContentPage } from "@/components/content-page";
import { SolistaSection } from "@/components/solista-section";
import { Mic2 } from "lucide-react";

export default function SementeDaFePage() {
  const solistaTab = {
    value: "solistas",
    label: "Solistas",
    icon: Mic2,
    content: <SolistaSection targetConjunto="Semente da Fé" />,
  };

  const sementeTheme = {
    primary: "221 83% 53%", // Blue 600
    accent: "217 91% 60%",
    gradient: "from-blue-600 via-blue-700 to-indigo-800",
  };

  return (
    <ContentPage
      title="Semente da Fé"
      description="Espaço dedicado à adoração e comunhão do conjunto Semente da Fé. Explore nossos hinos, notícias e agendas."
      extraTabs={[solistaTab]}
      colorTheme={sementeTheme}
    />
  );
}
