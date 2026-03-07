
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

  return (
    <ContentPage
      title="Grande Coral"
      description="Apresentações e repertório do Grande Coral."
      extraTabs={[solistaTab]}
    />
  );
}
