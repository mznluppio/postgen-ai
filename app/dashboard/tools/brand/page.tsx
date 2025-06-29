"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AnimataCard } from "@/components/ui/animata-card";
import { AcertenityButton } from "@/components/ui/acertenity-button";

export default function Page() {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [color, setColor] = useState("#6366f1");

  useEffect(() => {
    const stored = localStorage.getItem("brand-settings");
    if (stored) {
      const data = JSON.parse(stored);
      setName(data.name || "");
      setTagline(data.tagline || "");
      setColor(data.color || "#6366f1");
    }
  }, []);

  const save = () => {
    localStorage.setItem(
      "brand-settings",
      JSON.stringify({ name, tagline, color }),
    );
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Brand Guidelines</h1>
      <Separator />
      <AnimataCard className="space-y-4 p-4">
        <CardHeader>
          <CardTitle>Identité de marque</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Nom de marque"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Slogan"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <label htmlFor="color">Couleur principale</label>
            <input
              id="color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
          <AcertenityButton onClick={save}>Sauvegarder</AcertenityButton>
        </CardContent>
      </AnimataCard>
    </div>
  );
}
