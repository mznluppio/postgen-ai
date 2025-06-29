"use client";

import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite-config";
import { Query } from "appwrite";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
          <Card key={item.$id}>
            <CardHeader>
              <CardTitle className="text-base">{item.topic}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{item.content}</p>
            </CardContent>
          </Card>
        ))}
        {contents.length === 0 && (
          <p className="text-muted-foreground text-sm">Aucun contenu enregistré.</p>
        )}
      </div>
      <Button className="mt-4" onClick={loadContents} disabled={!currentOrganization}>
        Actualiser
      </Button>
    </div>
  );
}
