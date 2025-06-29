"use client";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function BillingPage() {
  const { currentOrganization } = useAuth();

  if (!currentOrganization) return null;

  const plan = currentOrganization.plan;
  const price = plan === "Enterprise" ? "99€/mois" : plan === "Pro" ? "29€/mois" : "Gratuit";

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Facturation</h1>
      <Separator />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Plan actuel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-lg font-semibold">{plan}</p>
          <p className="text-muted-foreground">{price}</p>
        </CardContent>
      </Card>
    </div>
  );
}
