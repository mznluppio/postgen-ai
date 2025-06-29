"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>En construction</CardTitle>
        </CardHeader>
        <CardContent>
          Des statistiques détaillées seront affichées ici.
        </CardContent>
      </Card>
    </div>
  );
}
