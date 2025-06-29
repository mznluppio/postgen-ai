"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { contentCreation } from "@/lib/navigation-data";
import { Button } from "@/components/ui/button";

export default function ContentPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Création de contenu</h1>
        <p className="text-muted-foreground">
          Choisissez un type de contenu à créer.
        </p>
      </div>
      <Separator />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contentCreation.map((cat) => (
          <Card key={cat.url}>
            <CardHeader>
              <CardTitle>{cat.title}</CardTitle>
              {cat.items?.length ? (
                <CardDescription>
                  {cat.items.map((i) => i.title).join(", ")}
                </CardDescription>
              ) : null}
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={cat.url}>Ouvrir</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
