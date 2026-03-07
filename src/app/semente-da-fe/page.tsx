
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

  return (
    <ContentPage
      title="Semente da Fé"
      description="Hinos, calendários e notícias da comunidade Semente da Fé."
      extraTabs={[solistaTab]}
    />
  );
}
