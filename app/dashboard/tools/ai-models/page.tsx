"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AnimataCard } from "@/components/ui/animata-card";
import { AcertenityButton } from "@/components/ui/acertenity-button";

const MODELS = ["Copilot Light", "Copilot Pro", "Copilot Vision"];

export default function Page() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Modèles IA</h1>
      <Separator />
      <div className="grid gap-4 sm:grid-cols-2">
        {MODELS.map((model) => (
          <AnimataCard
            key={model}
            className={selected === model ? "border-purple-500" : ""}
            onClick={() => setSelected(model)}
          >
            <CardHeader>
              <CardTitle>{model}</CardTitle>
            </CardHeader>
            <CardContent>
              {selected === model
                ? "Modèle sélectionné"
                : "Cliquer pour sélectionner"}
            </CardContent>
          </AnimataCard>
        ))}
      </div>
      {selected && (
        <AcertenityButton className="mt-4" disabled>
          {selected}
        </AcertenityButton>
      )}
    </div>
  );
}
