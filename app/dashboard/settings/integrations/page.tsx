"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function IntegrationsPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Intégrations</h1>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>En construction</CardTitle>
        </CardHeader>
        <CardContent>
          Gérez ici les intégrations tierces de votre organisation.
        </CardContent>
      </Card>
    </div>
  );
}
