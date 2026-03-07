
"use client";

import { ContentPage } from "@/components/content-page";
import { SolistaSection } from "@/components/solista-section";
import { Mic2 } from "lucide-react";

export default function LouvoresDeSiaoPage() {
  const solistaTab = {
    value: "solistas",
    label: "Solistas",
    icon: Mic2,
    content: <SolistaSection />,
  };

  return (
    <ContentPage
      title="Louvores de Sião"
      description="Explore os louvores, eventos e a galeria de solistas de Sião."
      extraTabs={[solistaTab]}
    />
  );
}
