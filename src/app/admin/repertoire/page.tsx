
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SolistaSection } from "@/components/solista-section";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, Music, Layers } from "lucide-react";

const ensembles = [
  { id: "all", name: "Todos os Conjuntos" },
  { id: "Semente da Fé", name: "Semente da Fé" },
  { id: "Louvores de Sião", name: "Louvores de Sião" },
  { id: "Grande Coral", name: "Grande Coral" },
];

export default function AdminRepertoirePage() {
  const { isAdmin } = useAuth();
  const [selectedEnsemble, setSelectedEnsemble] = useState<string>("all");

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground mt-2">Você precisa estar no Modo Admin para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-headline text-4xl font-bold text-primary flex items-center gap-3">
          <Layers className="h-10 w-10" /> Gestão de Repertório Geral
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Visualize e gerencie todos os hinos postados pelos solistas de cada conjunto.
        </p>
      </header>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" /> Selecionar Conjunto para Auditoria
          </CardTitle>
          <CardDescription>
            Escolha um conjunto específico para filtrar os hinos ou visualize o repertório global.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedEnsemble} onValueChange={setSelectedEnsemble}>
            <SelectTrigger className="w-full md:w-[300px] bg-white">
              <SelectValue placeholder="Selecione o conjunto" />
            </SelectTrigger>
            <SelectContent>
              {ensembles.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <SolistaSection targetConjunto={selectedEnsemble === "all" ? undefined : selectedEnsemble} />
      </div>
    </div>
  );
}
