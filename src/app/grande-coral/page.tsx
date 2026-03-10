
"use client";

import { ContentPage } from "@/components/content-page";
import { SolistaSection } from "@/components/solista-section";
import { Mic2 } from "lucide-react";

export default function GrandeCoralPage() {
  const solistaTab = {
    value: "solistas",
    label: "Solistas",
    icon: Mic2,
    content: <SolistaSection targetConjunto="Grande Coral" />,
  };

  const coralTheme = {
    primary: "271 91% 65%", // Purple 500
    accent: "292 84% 61%",
    gradient: "from-purple-500 via-violet-600 to-fuchsia-800",
  };

  return (
    <ContentPage
      title="Grande Coral"
      description="A grandiosidade do louvor em coro. Conheça nosso repertório, apresentações especiais e a galeria de solistas."
      extraTabs={[solistaTab]}
      colorTheme={coralTheme}
    />
  );
}
