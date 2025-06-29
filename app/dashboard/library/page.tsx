"use client";

import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite-config";
import { Query } from "appwrite";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AnimataCard } from "@/components/ui/animata-card";
import { AcertenityButton } from "@/components/ui/acertenity-button";

export default function LibraryPage() {
  const { currentOrganization } = useAuth();
  const [contents, setContents] = useState<any[]>([]);

  const loadContents = async () => {
    if (!currentOrganization) return;
    const res = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_CONTENTS_COLLECTION_ID!,
      [Query.equal("organizationId", currentOrganization.$id), Query.orderDesc("createdAt")],
    );
    setContents(res.documents);
  };

  useEffect(() => {
    loadContents();
  }, [currentOrganization]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Content Library</h1>
      <Separator />
      <div className="grid gap-4">
        {contents.map((item) => (
          <AnimataCard key={item.$id}>
            <CardHeader>
              <CardTitle className="text-base">{item.topic}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{item.content}</p>
            </CardContent>
          </AnimataCard>
        ))}
        {contents.length === 0 && (
          <p className="text-muted-foreground text-sm">Aucun contenu enregistré.</p>
        )}
      </div>
      <AcertenityButton className="mt-4" onClick={loadContents} disabled={!currentOrganization}>
        Actualiser
      </AcertenityButton>
    </div>
  );
}
