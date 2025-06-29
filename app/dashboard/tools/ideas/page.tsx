"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AnimataCard } from "@/components/ui/animata-card";
import { AcertenityButton } from "@/components/ui/acertenity-button";

const BASE_IDEAS = [
  "Top 10 astuces",
  "Guide complet pour débutants",
  "Erreurs fréquentes à éviter",
  "Tendances pour 2025",
  "Étude de cas inspirante",
];

export default function Page() {
  const [topic, setTopic] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);

  const generate = () => {
    if (!topic.trim()) return;
    const shuffled = [...BASE_IDEAS].sort(() => 0.5 - Math.random());
    const suggestions = shuffled.slice(0, 5).map((base) => `${base} sur ${topic}`);
    setIdeas(suggestions);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Idées de contenu</h1>
      <Separator />
      <div className="space-y-2 max-w-md">
        <Input
          placeholder="Sujet ou niche"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <AcertenityButton onClick={generate} disabled={!topic.trim()}>Générer</AcertenityButton>
      </div>
      {ideas.length > 0 && (
        <div className="grid gap-4">
          {ideas.map((idea) => (
            <AnimataCard key={idea}>
              <CardHeader>
                <CardTitle>{idea}</CardTitle>
              </CardHeader>
            </AnimataCard>
          ))}
        </div>
      )}
    </div>
  );
}
