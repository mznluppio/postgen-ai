"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getUsage, planLimits } from "@/lib/saas";
import { authService } from "@/lib/auth";

export default function BillingPage() {
  const { currentOrganization } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [usage, setUsage] = useState<number>(0);

  useEffect(() => {
    async function loadUsage() {
      if (!currentOrganization) return;
      const data = await getUsage(currentOrganization.$id);
      setUsage(data?.count || 0);
    }
    loadUsage();
  }, [currentOrganization]);

  useEffect(() => {
    const success = searchParams.get("success");
    const newPlan = searchParams.get("plan") as "pro" | "enterprise" | null;
    const orgId = searchParams.get("orgId");
    if (success === "1" && newPlan && orgId && currentOrganization) {
      if (orgId === currentOrganization.$id) {
        authService.updateOrganization(orgId, { plan: newPlan });
        router.replace("/dashboard/billing");
      }
    }
  }, [searchParams, currentOrganization, router]);

  if (!currentOrganization) return null;

  const plan = currentOrganization.plan as keyof typeof planLimits;
  const price = plan === "enterprise" ? "99€/mois" : plan === "pro" ? "29€/mois" : "Gratuit";

  const handleUpgrade = async (targetPlan: "pro" | "enterprise") => {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: targetPlan, orgId: currentOrganization.$id }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(data.url);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Facturation</h1>
      <Separator />
      <Card className="max-w-md space-y-4">
        <CardHeader>
          <CardTitle>Plan actuel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-lg font-semibold capitalize">{plan}</p>
          <p className="text-muted-foreground">{price}</p>
          <p>
            Utilisation ce mois-ci : {usage} / {planLimits[plan] === Infinity ? "∞" : planLimits[plan]}
          </p>
          {plan !== "enterprise" && (
            <Button onClick={() => handleUpgrade(plan === "starter" ? "pro" : "enterprise")}>Améliorer l'offre</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
