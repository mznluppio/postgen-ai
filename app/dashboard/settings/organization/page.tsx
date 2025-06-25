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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AuthPage from "@/app/auth/page";
import { useState } from "react";

export default function OrganizationSettingsPage() {
  const { currentOrganization, updateCurrentOrganization } = useAuth();
  const [name, setName] = useState(currentOrganization?.name || "");
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
      await updateCurrentOrganization({ name });
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
          <p className="text-muted-foreground text-sm">
            (Fonctionnalité à venir)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
