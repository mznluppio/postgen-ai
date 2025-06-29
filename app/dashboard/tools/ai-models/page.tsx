"use client";

import { Separator } from "@/components/ui/separator";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AnimataCard } from "@/components/ui/animata-card";
import { AcertenityButton } from "@/components/ui/acertenity-button";

export default function Page() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Ai-models</h1>
      <Separator />
      <AnimataCard>
        <CardHeader>
          <CardTitle>En construction</CardTitle>
        </CardHeader>
        <CardContent>
          Cette fonctionnalité sera bientôt disponible.
        </CardContent>
      </AnimataCard>
      <AcertenityButton className="mt-4" disabled>
        Ajouter
      </AcertenityButton>
    </div>
  );
}
