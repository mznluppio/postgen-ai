"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AnimataCard } from "@/components/ui/animata-card";
import { AcertenityButton } from "@/components/ui/acertenity-button";

interface Audience {
  id: string;
  name: string;
}

export default function Page() {
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("audiences");
    if (stored) setAudiences(JSON.parse(stored));
  }, []);

  const addAudience = () => {
    if (!name.trim()) return;
    const newAud = { id: Date.now().toString(), name };
    const updated = [...audiences, newAud];
    setAudiences(updated);
    localStorage.setItem("audiences", JSON.stringify(updated));
    setName("");
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Audiences cibles</h1>
      <Separator />
      <div className="flex gap-2 max-w-md">
        <Input
          placeholder="Nouvelle audience"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <AcertenityButton onClick={addAudience} disabled={!name.trim()}>Ajouter</AcertenityButton>
      </div>
      {audiences.length > 0 && (
        <div className="grid gap-2">
          {audiences.map((aud) => (
            <AnimataCard key={aud.id} className="p-3">
              <CardHeader>
                <CardTitle className="text-base">{aud.name}</CardTitle>
              </CardHeader>
            </AnimataCard>
          ))}
        </div>
      )}
    </div>
  );
}
