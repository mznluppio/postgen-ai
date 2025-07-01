"use client";

import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite-config";
import { Query } from "appwrite";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function AnalyticsPage() {
  const { currentOrganization } = useAuth();
  const [contentCount, setContentCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [projectStats, setProjectStats] = useState<
    { id: string; name: string; count: number }[]
  >([]);
  const [typeStats, setTypeStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    if (!currentOrganization) return;
    setLoading(true);
    const db = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const [contents, projects, members] = await Promise.all([
      databases.listDocuments(
        db,
        process.env.NEXT_PUBLIC_APPWRITE_CONTENTS_COLLECTION_ID!,
        [Query.equal("organizationId", currentOrganization.$id)],
      ),
      databases.listDocuments(
        db,
        process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID!,
        [Query.equal("organizationId", currentOrganization.$id)],
      ),
      databases.listDocuments(
        db,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        [Query.contains("organizations", currentOrganization.$id)],
      ),
    ]);

    setContentCount(contents.total ?? contents.documents.length);
    setProjectCount(projects.total ?? projects.documents.length);
    setMemberCount(members.total ?? members.documents.length);

    const projectMap: Record<string, { id: string; name: string; count: number }> = {};
    (projects.documents as any[]).forEach((p) => {
      projectMap[p.$id] = { id: p.$id, name: p.name, count: 0 };
    });

    const typeMap: Record<string, number> = {};
    (contents.documents as any[]).forEach((c: any) => {
      if (c.projectId && projectMap[c.projectId]) {
        projectMap[c.projectId].count += 1;
      }
      const t = c.type || "autre";
      typeMap[t] = (typeMap[t] || 0) + 1;
    });
    setProjectStats(Object.values(projectMap));
    setTypeStats(typeMap);
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, [currentOrganization]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <Separator />
      <div className="grid gap-4 sm:grid-cols-3">
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
        <Card>
          <CardHeader>
            <CardTitle>Membres</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {memberCount}
          </CardContent>
        </Card>
      </div>


      {projectStats.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Contenu par projet</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={projectStats} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projet</TableHead>
                <TableHead className="text-right">Contenus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectStats.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell className="text-right">{p.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {Object.keys(typeStats).length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Contenu par type</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={Object.entries(typeStats).map(([name, count]) => ({ name, count }))} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Nombre</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(typeStats).map(([type, count]) => (
                <TableRow key={type}>
                  <TableCell>{type}</TableCell>
                  <TableCell className="text-right">{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Button
        className="mt-4"
        disabled={!currentOrganization || loading}
        onClick={loadStats}
      >
        {loading ? "Chargement..." : "Rafraîchir"}
      </Button>
    </div>
  );
}
