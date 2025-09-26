"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CloudCog,
  FileText,
  MessagesSquare,
  Share2,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import AuthPage from "@/app/auth/page";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOrganizationIntegrations } from "@/hooks/useOrganizationIntegrations";
import { PLAN_LABELS, type Plan, isPlanAtLeast } from "@/lib/plans";
import type { IntegrationDocument } from "@/lib/integrations";

interface IntegrationDefinition {
  id: string;
  name: string;
  description: string;
  minimumPlan: Plan;
  docsUrl?: string;
  Icon: LucideIcon;
}

const INTEGRATIONS: IntegrationDefinition[] = [
  {
    id: "notion",
    name: "Notion",
    description:
      "Synchronisez vos pages Notion pour transformer vos documents en contenus publiables.",
    minimumPlan: "starter",
    docsUrl: "https://www.notion.so/help/connect-integration",
    Icon: FileText,
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description:
      "Importez vos contacts et automatisez vos workflows marketing depuis HubSpot.",
    minimumPlan: "pro",
    docsUrl: "https://developers.hubspot.com/docs/api/overview",
    Icon: Workflow,
  },
  {
    id: "slack",
    name: "Slack",
    description:
      "Recevez vos contenus générés directement dans vos canaux Slack et collaborez en temps réel.",
    minimumPlan: "starter",
    docsUrl: "https://api.slack.com/start",
    Icon: MessagesSquare,
  },
  {
    id: "zapier",
    name: "Zapier",
    description:
      "Créez des automatisations multi-outils en connectant Postgen AI à des milliers d'applications.",
    minimumPlan: "pro",
    docsUrl: "https://help.zapier.com/hc/en-us",
    Icon: Share2,
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description:
      "Synchronisez vos comptes clés et vos pipelines Salesforce avec vos campagnes Postgen AI.",
    minimumPlan: "enterprise",
    docsUrl: "https://developer.salesforce.com/docs",
    Icon: CloudCog,
  },
];

function formatMetadataValue(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return value.toString();
  }
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}

export default function IntegrationsSettingsPage() {
  const { currentOrganization } = useAuth();
  const {
    integrations,
    loading,
    error,
    connectIntegration,
    disconnectIntegration,
  } = useOrganizationIntegrations(currentOrganization);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] =
    useState<IntegrationDefinition | null>(null);
  const [token, setToken] = useState("");
  const [label, setLabel] = useState("");
  const [metadataJson, setMetadataJson] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingIntegrationId, setPendingIntegrationId] = useState<string | null>(
    null,
  );

  const connectionsMap = useMemo(() => {
    return integrations.reduce<Record<string, IntegrationDocument>>((acc, doc) => {
      acc[doc.integration] = doc;
      return acc;
    }, {});
  }, [integrations]);

  if (!currentOrganization) {
    return (
      <AuthGuard fallback={<AuthPage />}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Intégrations</CardTitle>
              <CardDescription>
                Veuillez créer une organisation pour accéder aux intégrations.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  const handleOpenDialog = (definition: IntegrationDefinition) => {
    const existing = connectionsMap[definition.id];
    setSelectedIntegration(definition);
    setToken("");
    const metadata = existing?.metadata;
    const isObjectMetadata =
      metadata && typeof metadata === "object" && !Array.isArray(metadata);

    if (isObjectMetadata) {
      const record = metadata as Record<string, unknown>;
      setLabel(
        typeof record.label === "string" ? (record.label as string) : "",
      );

      const { label: _ignored, ...rest } = record;
      setMetadataJson(
        Object.keys(rest).length > 0 ? JSON.stringify(rest, null, 2) : "",
      );
    } else {
      setMetadataJson("");
      setLabel("");
    }

    setFormError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedIntegration(null);
    setToken("");
    setLabel("");
    setMetadataJson("");
    setFormError(null);
  };

  const handleConnect = async () => {
    if (!selectedIntegration) return;

    setSubmitting(true);
    setFormError(null);

    try {
      const metadata: Record<string, unknown> = {};

      if (label.trim()) {
        metadata.label = label.trim();
      }

      if (metadataJson.trim()) {
        const parsed = JSON.parse(metadataJson);
        if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) {
          throw new Error("Le format du JSON est invalide");
        }
        Object.assign(metadata, parsed);
      }

      const sanitizedToken = token.trim();
      await connectIntegration(selectedIntegration.id, sanitizedToken, metadata);
      handleCloseDialog();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Impossible de connecter l'intégration";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    setPendingIntegrationId(integrationId);
    try {
      await disconnectIntegration(integrationId);
    } catch (err) {
      console.error("Erreur lors de la déconnexion de l'intégration:", err);
    } finally {
      setPendingIntegrationId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Intégrations</h1>
        <p className="text-muted-foreground">
          Connectez Postgen AI à vos outils existants pour synchroniser vos données et
          automatiser vos workflows.
        </p>
      </div>

      <Separator />

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Une erreur est survenue</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {INTEGRATIONS.map((integration) => {
          const connection = connectionsMap[integration.id];
          const isConnected = connection?.status === "connected";
          const isAllowed = isPlanAtLeast(
            currentOrganization.plan,
            integration.minimumPlan,
          );
          const minimumPlanLabel = `${PLAN_LABELS[integration.minimumPlan]}+`;

          return (
            <Card key={integration.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-primary/10 p-2">
                    <integration.Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold">
                      {integration.name}
                    </CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline">{minimumPlanLabel}</Badge>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant={isConnected ? "secondary" : "outline"}>
                    {isConnected ? "Connecté" : "Non connecté"}
                  </Badge>
                  {connection?.connectedAt && (
                    <span className="text-xs text-muted-foreground">
                      Dernière connexion le {" "}
                      {new Date(connection.connectedAt).toLocaleString()}
                    </span>
                  )}
                </div>

                {connection?.metadata &&
                  typeof connection.metadata === "object" &&
                  !Array.isArray(connection.metadata) && (
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-foreground">Détails de la connexion</p>
                      <div className="space-y-1 rounded-md border bg-muted/50 p-3">
                        {Object.entries(connection.metadata).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between gap-3 text-xs text-muted-foreground"
                          >
                            <span className="font-medium text-foreground capitalize">
                              {key}
                            </span>
                            <span className="truncate text-right">
                              {formatMetadataValue(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {integration.docsUrl && (
                  <p className="text-sm text-muted-foreground">
                    Besoin d'aide ? Consultez la {" "}
                    <Link
                      href={integration.docsUrl}
                      target="_blank"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      documentation officielle
                    </Link>
                    .
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex items-center justify-between gap-2">
                <Button
                  disabled={!isAllowed || loading || pendingIntegrationId === integration.id}
                  onClick={() => handleOpenDialog(integration)}
                >
                  {isConnected ? "Reconfigurer" : "Connecter"}
                </Button>

                {isConnected ? (
                  <Button
                    variant="ghost"
                    disabled={pendingIntegrationId === integration.id}
                    onClick={() => handleDisconnect(integration.id)}
                  >
                    Déconnecter
                  </Button>
                ) : (
                  !isAllowed && (
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/settings/organization">
                        Mettre à niveau
                      </Link>
                    </Button>
                  )
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseDialog();
          } else {
            setDialogOpen(open);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedIntegration
                ? `Connecter ${selectedIntegration.name}`
                : "Connecter une intégration"}
            </DialogTitle>
            <DialogDescription>
              Renseignez le token d'accès généré dans votre outil pour finaliser la
              connexion.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertTitle>Impossible de connecter l'intégration</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="integration-token">Token d'accès</Label>
              <Input
                id="integration-token"
                type="password"
                placeholder="Copiez le token généré par votre outil"
                value={token}
                onChange={(event) => setToken(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="integration-label">Nom de la connexion (optionnel)</Label>
              <Input
                id="integration-label"
                placeholder="Ex: Workspace marketing"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="integration-metadata">
                Métadonnées supplémentaires (JSON optionnel)
              </Label>
              <Textarea
                id="integration-metadata"
                placeholder='{"workspaceId": "..."}'
                value={metadataJson}
                onChange={(event) => setMetadataJson(event.target.value)}
                className="font-mono text-xs"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCloseDialog} disabled={submitting}>
              Annuler
            </Button>
            <Button onClick={handleConnect} disabled={submitting || !token.trim()}>
              {submitting ? "Connexion..." : "Connecter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
