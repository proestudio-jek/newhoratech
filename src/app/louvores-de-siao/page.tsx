
"use client";

import { ContentPage } from "@/components/content-page";
import { SolistaSection } from "@/components/solista-section";
import { Mic2 } from "lucide-react";

export default function LouvoresDeSiaoPage() {
  const solistaTab = {
    value: "solistas",
    label: "Solistas",
    icon: Mic2,
    content: <SolistaSection targetConjunto="Louvores de Sião" />,
  };

  const siaoTheme = {
    primary: "199 89% 48%", // Sky 600
    accent: "187 92% 45%",
    gradient: "from-sky-500 via-cyan-600 to-teal-700",
  };

  return (
    <ContentPage
      title="Louvores de Sião"
      description="Seja bem-vindo ao portal do conjunto Sião. Aqui você encontra os louvores que tocam o coração e as últimas novidades."
      extraTabs={[solistaTab]}
      colorTheme={siaoTheme}
    />
  );
}
