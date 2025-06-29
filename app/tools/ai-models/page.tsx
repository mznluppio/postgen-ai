"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Page() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Ai-models</h1>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>En construction</CardTitle>
        </CardHeader>
        <CardContent>
          Cette fonctionnalité sera bientôt disponible.
        </CardContent>
      </Card>
    </div>
  );
}
