"use client";

import { useCallback, useMemo, useState } from "react";
import { ID, Storage } from "appwrite";

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
import { Badge } from "@/components/ui/badge";
import AuthPage from "@/app/auth/page";
import { client } from "@/lib/appwrite-config";
import { useOrganizationMembers } from "@/hooks/useOrganizationMembers";
import { getNextPlan, PLAN_LABELS } from "@/lib/plans";

const storage = new Storage(client);

export default function OrganizationSettingsPage() {
  const { currentOrganization, updateCurrentOrganization, refreshUser } =
    useAuth();
  const [name, setName] = useState(currentOrganization?.name || "");
  const [description, setDescription] = useState(
    currentOrganization?.description || "",
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  const handleTeamResolved = useCallback(async () => {
    await refreshUser();
  }, [refreshUser]);

  const memberOptions = useMemo(
    () => ({
      onTeamResolved: handleTeamResolved,
    }),
    [handleTeamResolved],
  );

  const { members, loading: membersLoading, limit, isAtLimit, refresh } =
    useOrganizationMembers(currentOrganization, memberOptions);

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

  const nextPlan = currentOrganization
    ? getNextPlan(currentOrganization.plan)
    : null;

  const handleUpgrade = async () => {
    if (!currentOrganization || !nextPlan) return;

    setUpgradeLoading(true);
    setUpgradeSuccess(false);
    setUpgradeError(null);

    try {
      await updateCurrentOrganization({ plan: nextPlan });
      await refresh();
      setUpgradeSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setUpgradeError(message);
    } finally {
      setUpgradeLoading(false);
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
          <CardTitle>Membres et plan</CardTitle>
          <CardDescription>
            Gérez les membres de votre organisation et surveillez votre
            capacité selon le plan actuel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold">Plan actuel</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {PLAN_LABELS[currentOrganization.plan]}
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Membres</h3>
            {membersLoading ? (
              <p className="text-sm text-muted-foreground">
                Chargement des membres...
              </p>
            ) : members.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun membre pour le moment.
              </p>
            ) : (
              <ul className="space-y-2">
                {members.map((member) => {
                  const isPending = !member.confirm;
                  const statusLabel = isPending
                    ? "Invitation en attente"
                    : "Actif";
                  const roleLabel = member.roles[0]
                    ? member.roles[0].charAt(0).toUpperCase() +
                      member.roles[0].slice(1)
                    : "Membre";

                  return (
                    <li
                      key={member.$id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium">
                          {member.userEmail || member.userName || "Membre"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Rôle : {roleLabel}
                        </p>
                      </div>
                      <Badge variant={isPending ? "secondary" : "default"}>
                        {statusLabel}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="text-xs text-muted-foreground">
              {limit === null
                ? `Capacité illimitée avec le plan ${PLAN_LABELS[currentOrganization.plan]}.`
                : `${members.length} membre(s) sur ${limit} autorisé(s).`}
            </p>
          </div>
          {isAtLimit && nextPlan && (
            <div className="space-y-2 rounded-md border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">
                Vous avez atteint la limite de membres pour votre plan actuel.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="destructive"
                  onClick={handleUpgrade}
                  disabled={upgradeLoading}
                >
                  {upgradeLoading
                    ? "Mise à niveau en cours..."
                    : `Mettre à niveau vers ${PLAN_LABELS[nextPlan]}`}
                </Button>
                {upgradeError && (
                  <p className="text-sm text-destructive">{upgradeError}</p>
                )}
                {upgradeSuccess && !upgradeError && (
                  <p className="text-sm text-green-600">
                    Plan mis à jour avec succès.
                  </p>
                )}
              </div>
            </div>
          )}
          {!nextPlan && limit !== null && (
            <p className="text-sm text-muted-foreground">
              Vous êtes déjà sur le plan le plus élevé disponible.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
