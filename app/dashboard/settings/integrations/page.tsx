"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AnimataCard } from "@/components/ui/animata-card";
import { CuicuiButton } from "@/components/ui/cuicui-button";

export default function IntegrationsPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Intégrations</h1>
      <Separator />
      <AnimataCard className="space-y-2">
        <CardHeader>
          <CardTitle>Canva</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Connectez votre compte Canva pour modifier les visuels générés.</p>
          <CuicuiButton asChild>
            <a href="/api/canva/auth">Connecter Canva</a>
          </CuicuiButton>
        </CardContent>
      </AnimataCard>
    </div>
  );
}
