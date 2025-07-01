"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AnimataCard } from "@/components/ui/animata-card";
import { CuicuiButton } from "@/components/ui/cuicui-button";

export default function IntegrationsPage() {
  const params = useSearchParams();
  const status = params.get("canva");
  const error = params.get("error");

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Intégrations</h1>
      <Separator />
      <AnimataCard className="space-y-2">
        <CardHeader>
          <CardTitle>Canva</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "connected" && (
            <p className="text-sm text-green-600">Compte Canva connecté !</p>
          )}
          {error && <p className="text-sm text-red-600">Erreur de connexion.</p>}
          <p>Connectez votre compte Canva pour modifier les visuels générés.</p>
          <CuicuiButton asChild>
            <a href="/api/canva/auth">Connecter Canva</a>
          </CuicuiButton>
        </CardContent>
      </AnimataCard>
    </div>
  );
}
