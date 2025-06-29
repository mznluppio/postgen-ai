"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LibraryPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Content Library</h1>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>En construction</CardTitle>
        </CardHeader>
        <CardContent>
          Cette page permettra d'accéder à tout votre contenu généré.
        </CardContent>
      </Card>
    </div>
  );
}
