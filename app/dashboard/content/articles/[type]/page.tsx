"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import Link from "next/link";
import { databases } from "@/lib/appwrite-config";
import { Query } from "appwrite";
import { motion } from "framer-motion";

export default function SocialProjectSelectorPage() {
  const { currentOrganization } = useAuth();
  const { type } = useParams();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
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

    fetchProjects();
  }, [currentOrganization]);

  if (!currentOrganization) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Contenu {type}</CardTitle>
            <CardDescription>
              Veuillez créer une organisation pour commencer.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold">Choisissez un projet</h1>
        <p className="text-muted-foreground">
          Sélectionnez un projet pour créer du contenu {type}.
        </p>
      </motion.div>

      <Separator />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project, index) => (
          <motion.div
            key={project.$id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>
                  {project.description || "Pas de description"}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link
                    href={`/dashboard/content/social/${type}/${project.$id}`}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Créer du contenu
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
