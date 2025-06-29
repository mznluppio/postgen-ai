"use client";

import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite-config";
import { Query } from "appwrite";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function AnalyticsPage() {
  const { currentOrganization } = useAuth();
  const [contentCount, setContentCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);

  const loadStats = async () => {
    if (!currentOrganization) return;
    const db = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const contents = await databases.listDocuments(
      db,
      process.env.NEXT_PUBLIC_APPWRITE_CONTENTS_COLLECTION_ID!,
      [Query.equal("organizationId", currentOrganization.$id)],
    );
    setContentCount(contents.total ?? contents.documents.length);

    const projects = await databases.listDocuments(
      db,
      process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID!,
      [Query.equal("organizationId", currentOrganization.$id)],
    );
    setProjectCount(projects.total ?? projects.documents.length);
  };

  useEffect(() => {
    loadStats();
  }, [currentOrganization]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <Separator />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contenus créés</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {contentCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Projets</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {projectCount}
          </CardContent>
        </Card>
      </div>
      <Button
        className="mt-4"
        disabled={!currentOrganization}
        onClick={loadStats}
      >
        Rafraîchir
      </Button>
    </div>
  );
}
