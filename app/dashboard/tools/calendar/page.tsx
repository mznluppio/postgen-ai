"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { databases } from "@/lib/appwrite-config";
import { Query } from "appwrite";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { AnimataCard } from "@/components/ui/animata-card";
import { AcertenityButton } from "@/components/ui/acertenity-button";

interface ContentItem {
  $id: string;
  topic: string;
  createdAt: string;
}

export default function Page() {
  const { currentOrganization } = useAuth();
  const [items, setItems] = useState<Record<string, ContentItem[]>>({});
  const [loading, setLoading] = useState(false);

  const loadItems = async () => {
    if (!currentOrganization) return;
    setLoading(true);
    try {
      const res = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CONTENTS_COLLECTION_ID!,
        [
          Query.equal("organizationId", currentOrganization.$id),
          Query.orderDesc("createdAt"),
        ],
      );
      const groups: Record<string, ContentItem[]> = {};
      for (const doc of res.documents as ContentItem[]) {
        const date = doc.createdAt.slice(0, 10);
        groups[date] = groups[date] ? [...groups[date], doc] : [doc];
      }
      setItems(groups);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [currentOrganization]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Calendrier de contenu</h1>
      <Separator />
      {Object.keys(items).length === 0 ? (
        <p className="text-muted-foreground">Aucun contenu planifié.</p>
      ) : (
        <div className="grid gap-4">
          {Object.entries(items).map(([date, docs]) => (
            <AnimataCard key={date} className="space-y-2">
              <CardHeader>
                <CardTitle>{new Date(date).toLocaleDateString()}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {docs.map((d) => (
                  <p key={d.$id} className="text-sm">
                    {d.topic}
                  </p>
                ))}
              </CardContent>
            </AnimataCard>
          ))}
        </div>
      )}
      <AcertenityButton onClick={loadItems} disabled={!currentOrganization || loading} className="mt-4">
        {loading ? "Chargement..." : "Actualiser"}
      </AcertenityButton>
    </div>
  );
}
