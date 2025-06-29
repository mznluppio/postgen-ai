"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import AuthPage from "@/app/auth/page";
import { useState } from "react";
import { ID, Storage } from "appwrite";
import { client } from "@/lib/appwrite-config";

const storage = new Storage(client);

export default function OrganizationSettingsPage() {
  const { currentOrganization, updateCurrentOrganization } = useAuth();
  const [name, setName] = useState(currentOrganization?.name || "");
  const [description, setDescription] = useState(
    currentOrganization?.description || "",
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!currentOrganization) {
    return (
      <AuthGuard fallback={<AuthPage />}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Paramètres de l'organisation</CardTitle>
              <CardDescription>
                Veuillez créer une organisation pour accéder aux paramètres.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      let logoUrl = currentOrganization.logo;

      if (logoFile) {
        const uploaded = await storage.createFile(
          process.env.NEXT_PUBLIC_APPWRITE_ORGSLOGO_ID || "",
          ID.unique(),
          logoFile,
        );

        logoUrl = uploaded.$id;
      }

      await updateCurrentOrganization({
        name,
        logo: logoUrl,
        description,
      });

      setSuccess(true);
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Paramètres de l'organisation</h1>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
          <CardDescription>
            Modifiez les informations de votre organisation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="org-name">Nom de l'organisation</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de l'organisation"
            />
          </div>

          <div>
            <Label htmlFor="org-description">
              Description de l'organisation
            </Label>
            <Input
              id="org-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre organisation"
            />
          </div>

          <div>
            <Label htmlFor="logo">Logo de l'organisation</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            />
          </div>

          <div>
            <Label>Plan actuel</Label>
            <p className="text-sm text-muted-foreground capitalize">
              {currentOrganization.plan}
            </p>
          </div>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>

          {success && (
            <p className="text-sm text-green-600">
              Modifications enregistrées avec succès.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gérer les membres</CardTitle>
          <CardDescription>
            Invitez ou supprimez des membres de l'organisation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/dashboard/settings/team">Gérer l'équipe</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
