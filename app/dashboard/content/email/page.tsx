"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { contentCreation } from "@/lib/navigation-data";
import { Button } from "@/components/ui/button";

export default function EmailHome() {
  const email = contentCreation.find((c) => c.url.includes("/email"));
  const items = email?.items || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Email Marketing</h1>
        <p className="text-muted-foreground">Sélectionnez un type d'email.</p>
      </div>
      <Separator />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const href = item.url.startsWith("/dashboard")
            ? item.url
            : `/dashboard${item.url}`;
          return (
            <Card key={item.url}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={href}>Ouvrir</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
