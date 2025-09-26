"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AuthPage from "@/app/auth/page";
import { client } from "@/lib/appwrite-config";
import { useOrganizationMembers } from "@/hooks/useOrganizationMembers";
import { getNextPlan, PLAN_LABELS } from "@/lib/plans";

const storage = new Storage(client);

export default function OrganizationSettingsPage() {
  const { currentOrganization, updateCurrentOrganization, refreshUser } =
    useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [priorityEmail, setPriorityEmail] = useState("");
  const [priorityPhone, setPriorityPhone] = useState("");
  const [slackChannel, setSlackChannel] = useState("");
  const [slaTier, setSlaTier] = useState("");
  const [slaDocumentUrl, setSlaDocumentUrl] = useState("");
  const [ticketPortalUrl, setTicketPortalUrl] = useState("");
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);
  const [dataRegions, setDataRegions] = useState<string[]>([]);
  const [preferredRegion, setPreferredRegion] = useState("eu");
  const [allowCustomRegion, setAllowCustomRegion] = useState(false);
  const [complianceArtifacts, setComplianceArtifacts] = useState("");
  const [complianceContact, setComplianceContact] = useState("");
  const [complianceLoading, setComplianceLoading] = useState(false);
  const [complianceSuccess, setComplianceSuccess] = useState(false);
  const [complianceError, setComplianceError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentOrganization) return;

    setName(currentOrganization.name || "");
    setDescription(currentOrganization.description || "");
    setPriorityEmail(currentOrganization.supportCenter?.priorityEmail || "");
    setPriorityPhone(currentOrganization.supportCenter?.priorityPhone || "");
    setSlackChannel(currentOrganization.supportCenter?.slackChannel || "");
    setSlaTier(currentOrganization.supportCenter?.slaTier || "");
    setSlaDocumentUrl(
      currentOrganization.supportCenter?.slaDocumentUrl || "",
    );
    setTicketPortalUrl(
      currentOrganization.supportCenter?.ticketPortalUrl || "",
    );

    const regions = currentOrganization.compliance?.dataRegions || ["eu"];
    setDataRegions(regions);
    setPreferredRegion(
      currentOrganization.compliance?.preferredDataRegion || regions[0] || "eu",
    );
    setAllowCustomRegion(
      currentOrganization.compliance?.allowCustomRegion ??
        currentOrganization.plan === "enterprise",
    );
    setComplianceArtifacts(
      (currentOrganization.compliance?.complianceArtifacts || []).join("\n"),
    );
    setComplianceContact(
      currentOrganization.compliance?.requestContactEmail || "",
    );
  }, [currentOrganization]);

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

  const availableRegions = [
    { value: "eu", label: "Union européenne (EU)" },
    { value: "us", label: "Amérique du Nord (US)" },
    { value: "apac", label: "Asie-Pacifique (APAC)" },
  ];

  const handleSupportSubmit = async () => {
    setSupportLoading(true);
    setSupportSuccess(false);
    setSupportError(null);

    try {
      await updateCurrentOrganization({
        supportCenter: {
          priorityEmail,
          priorityPhone,
          slackChannel,
          slaTier,
          slaDocumentUrl,
          ticketPortalUrl,
        },
      });
      setSupportSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setSupportError(message);
    } finally {
      setSupportLoading(false);
    }
  };

  const handleComplianceSubmit = async () => {
    setComplianceLoading(true);
    setComplianceSuccess(false);
    setComplianceError(null);

    try {
      const normalizedRegions =
        dataRegions.length > 0 ? dataRegions : [preferredRegion];
      const regionsSet = new Set([...normalizedRegions, preferredRegion]);
      const artifacts = complianceArtifacts
        .split("\n")
        .map((value) => value.trim())
        .filter(Boolean);

      await updateCurrentOrganization({
        compliance: {
          dataRegions: Array.from(regionsSet),
          preferredDataRegion: preferredRegion,
          allowCustomRegion,
          complianceArtifacts: artifacts,
          requestContactEmail: complianceContact,
        },
      });
      setComplianceSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setComplianceError(message);
    } finally {
      setComplianceLoading(false);
    }
  };

  const nextPlan = currentOrganization
    ? getNextPlan(currentOrganization.plan)
    : null;
  const isEnterprise = currentOrganization?.plan === "enterprise";

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
          <CardTitle>Support &amp; SLA Enterprise</CardTitle>
          <CardDescription>
            Définissez vos canaux de support prioritaire et partagez vos
            engagements de service avec les équipes internes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEnterprise && (
            <div className="rounded-md border border-dashed border-purple-200 bg-purple-50/40 p-4 text-sm text-purple-800">
              <Badge variant="secondary" className="mr-2 uppercase">
                Enterprise
              </Badge>
              Ces options sont disponibles avec le plan Enterprise. Passez au
              plan supérieur pour activer les canaux de support dédiés et les
              engagements SLA personnalisés.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="priority-email">Email prioritaire</Label>
                <Input
                  id="priority-email"
                  type="email"
                  value={priorityEmail}
                  onChange={(e) => setPriorityEmail(e.target.value)}
                  placeholder="enterprise-support@postgen.ai"
                  disabled={!isEnterprise}
                />
              </div>

              <div>
                <Label htmlFor="priority-phone">Ligne directe</Label>
                <Input
                  id="priority-phone"
                  value={priorityPhone}
                  onChange={(e) => setPriorityPhone(e.target.value)}
                  placeholder="+33 1 86 22 00 00"
                  disabled={!isEnterprise}
                />
              </div>

              <div>
                <Label htmlFor="support-slack">Canal Slack / Teams</Label>
                <Input
                  id="support-slack"
                  value={slackChannel}
                  onChange={(e) => setSlackChannel(e.target.value)}
                  placeholder="#postgen-enterprise"
                  disabled={!isEnterprise}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="support-sla-tier">Niveau d'engagement SLA</Label>
                <Input
                  id="support-sla-tier"
                  value={slaTier}
                  onChange={(e) => setSlaTier(e.target.value)}
                  placeholder="Temps de réponse 1h / résolution 4h"
                  disabled={!isEnterprise}
                />
              </div>

              <div>
                <Label htmlFor="support-sla-document">Document SLA</Label>
                <Input
                  id="support-sla-document"
                  type="url"
                  value={slaDocumentUrl}
                  onChange={(e) => setSlaDocumentUrl(e.target.value)}
                  placeholder="https://docs.postgen.ai/sla.pdf"
                  disabled={!isEnterprise}
                />
                <p className="text-xs text-muted-foreground">
                  Ajoutez un lien vers votre contrat de niveau de service ou un
                  dossier partagé.
                </p>
              </div>

              <div>
                <Label htmlFor="support-ticket-portal">
                  Portail de tickets prioritaire
                </Label>
                <Input
                  id="support-ticket-portal"
                  type="url"
                  value={ticketPortalUrl}
                  onChange={(e) => setTicketPortalUrl(e.target.value)}
                  placeholder="https://support.postgen.ai/enterprise"
                  disabled={!isEnterprise}
                />
                <p className="text-xs text-muted-foreground">
                  Cette URL sera affichée dans le centre de support Enterprise.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleSupportSubmit}
              disabled={supportLoading || !isEnterprise}
            >
              {supportLoading
                ? "Enregistrement..."
                : "Enregistrer la configuration du support"}
            </Button>
            {supportSuccess && (
              <p className="text-sm text-green-600">
                Canaux de support mis à jour avec succès.
              </p>
            )}
            {supportError && (
              <p className="text-sm text-red-600">{supportError}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hébergement &amp; conformité</CardTitle>
          <CardDescription>
            Contrôlez la région d'hébergement des données et documentez les
            artefacts de conformité disponibles pour vos équipes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Région de données préférée</Label>
                <Select
                  value={preferredRegion}
                  onValueChange={setPreferredRegion}
                  disabled={!isEnterprise}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une région" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRegions.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Régions activées</Label>
                <div className="space-y-3 rounded-md border p-4">
                  {availableRegions.map((region) => (
                    <div key={region.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`region-${region.value}`}
                        checked={dataRegions.includes(region.value)}
                        onCheckedChange={(checked) => {
                          if (!isEnterprise) return;
                          setDataRegions((prev) => {
                            if (checked) {
                              if (prev.includes(region.value)) return prev;
                              return [...prev, region.value];
                            }
                            const next = prev.filter(
                              (item) => item !== region.value,
                            );
                            return next.length > 0 ? next : prev;
                          });
                        }}
                        disabled={!isEnterprise}
                      />
                      <Label
                        htmlFor={`region-${region.value}`}
                        className="text-sm font-normal"
                      >
                        {region.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 rounded-md border p-4">
                <div>
                  <p className="text-sm font-medium">
                    Régions personnalisées sur demande
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Permettre aux clients Enterprise de demander une région
                    dédiée ou souveraine.
                  </p>
                </div>
                <Switch
                  checked={allowCustomRegion}
                  onCheckedChange={(checked) =>
                    setAllowCustomRegion(Boolean(checked))
                  }
                  disabled={!isEnterprise}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="compliance-artifacts">
                  Artefacts de conformité disponibles
                </Label>
                <Textarea
                  id="compliance-artifacts"
                  value={complianceArtifacts}
                  onChange={(e) => setComplianceArtifacts(e.target.value)}
                  placeholder={
                    "ISO 27001\nRapport SOC 2\nPreuve RGPD hébergement EU"
                  }
                  disabled={!isEnterprise}
                  className="min-h-[140px]"
                />
                <p className="text-xs text-muted-foreground">
                  Séparez chaque document ou ressource sur une nouvelle ligne.
                </p>
              </div>

              <div>
                <Label htmlFor="compliance-contact">
                  Contact conformité / sécurité
                </Label>
                <Input
                  id="compliance-contact"
                  type="email"
                  value={complianceContact}
                  onChange={(e) => setComplianceContact(e.target.value)}
                  placeholder="compliance@postgen.ai"
                  disabled={!isEnterprise}
                />
                <p className="text-xs text-muted-foreground">
                  Cet email apparaîtra dans le centre de support pour les
                  demandes d'audit ou de due diligence.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleComplianceSubmit}
              disabled={complianceLoading || !isEnterprise}
            >
              {complianceLoading
                ? "Enregistrement..."
                : "Enregistrer les options de conformité"}
            </Button>
            {complianceSuccess && (
              <p className="text-sm text-green-600">
                Paramètres de conformité mis à jour.
              </p>
            )}
            {complianceError && (
              <p className="text-sm text-red-600">{complianceError}</p>
            )}
          </div>
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
