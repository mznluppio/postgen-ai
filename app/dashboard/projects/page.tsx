"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Folder } from "lucide-react";
import { databases } from "@/lib/appwrite-config";
import { ID, Query } from "appwrite";
import Link from "next/link";

export default function ProjectPage() {
  const { currentOrganization, user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    if (!currentOrganization) return;

    try {
      const res = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID!,
        [Query.equal("organizationId", currentOrganization.$id)],
      );
      setProjects(res.documents);
    } catch (error) {
      console.error("Erreur lors du chargement des projets :", error);
    }
  };

  const handleCreateProject = async () => {
    if (!name || !currentOrganization || !user) return;

    setLoading(true);
    try {
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID!,
        ID.unique(),
        {
          name,
          description,
          organizationId: currentOrganization.$id,
          userId: user.$id,
          createdAt: new Date().toISOString(),
        },
      );
      setName("");
      setDescription("");
      fetchProjects();
    } catch (error) {
      console.error("Erreur lors de la création du projet :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentOrganization]);

  if (!currentOrganization) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Projets</CardTitle>
              <CardDescription>
                Veuillez créer une organisation pour gérer vos projets.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Projets</h1>
        <p className="text-muted-foreground text-sm">
          Créez et gérez vos projets pour organiser votre contenu.
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Créer un nouveau projet</CardTitle>
          <CardDescription>Organisez votre contenu par projet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Nom du projet"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Description (facultatif)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={handleCreateProject} disabled={loading || !name}>
            <Plus className="mr-2 h-4 w-4" />
            {loading ? "Création..." : "Créer le projet"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Mes projets</h2>
        {projects.length === 0 ? (
          <p className="text-muted-foreground">Aucun projet pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project.$id}
                href={`/dashboard/projects/${project.$id}`}
                className="transition hover:shadow-md rounded-lg border p-4 bg-background hover:bg-muted"
              >
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <Folder className="w-4 h-4" />
                  <span className="font-medium">{project.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {project.description || "Pas de description"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
