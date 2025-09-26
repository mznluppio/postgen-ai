"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  LifeBuoy,
  Mail,
  MessageCircle,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

export default function SupportCenterPage() {
  const { currentOrganization } = useAuth();

  const support = currentOrganization?.supportCenter;
  const compliance = currentOrganization?.compliance;
  const isEnterprise = currentOrganization?.plan === "enterprise";

  const complianceArtifacts = useMemo(() => {
    return compliance?.complianceArtifacts?.filter(Boolean) ?? [];
  }, [compliance?.complianceArtifacts]);

  const hasComplianceContact = Boolean(compliance?.requestContactEmail);

  if (!currentOrganization) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Centre de support</h1>
          <p className="text-muted-foreground">
            Retrouvez vos engagements Enterprise, vos canaux de contact prioritaire
            et les ressources de conformité associées à {currentOrganization.name}.
          </p>
        </div>
        {isEnterprise ? (
          support?.ticketPortalUrl ? (
            <Button asChild>
              <a
                href={support.ticketPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <LifeBuoy className="h-4 w-4" />
                Soumettre un ticket prioritaire
              </a>
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/dashboard/settings/organization">
                <LifeBuoy className="h-4 w-4" />
                Configurez le portail de tickets
              </Link>
            </Button>
          )
        ) : (
          <Button variant="outline" asChild>
            <Link href="/dashboard/settings/organization">
              Passer au plan Enterprise
            </Link>
          </Button>
        )}
      </div>

      {!isEnterprise && (
        <Card>
          <CardHeader>
            <CardTitle>Support avancé réservé aux clients Enterprise</CardTitle>
            <CardDescription>
              Accédez à des SLA contractuels, une équipe de support dédiée et des
              réponses accélérées en passant au plan Enterprise.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/settings/organization">
                Découvrir le plan Enterprise
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-600" />
              Canaux de contact prioritaires
            </CardTitle>
            <CardDescription>
              Les coordonnées partagées ci-dessous sont transmises à l'équipe support
              dédiée à votre organisation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Email prioritaire</p>
              <p className="text-sm text-muted-foreground">
                {support?.priorityEmail ||
                  "Définissez un email prioritaire depuis les paramètres d'organisation."}
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Ligne directe</p>
              <p className="text-sm text-muted-foreground">
                {support?.priorityPhone ||
                  "Ajoutez une ligne téléphonique pour les incidents critiques."}
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Canal instantané</p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-purple-600" />
                {support?.slackChannel ||
                  "Indiquez un canal Slack, Teams ou une URL de chat dédiée."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Engagements SLA
            </CardTitle>
            <CardDescription>
              Suivez les engagements contractuels convenus avec Postgen AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="uppercase">
                {support?.slaTier || "Non défini"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {support?.slaTier
                  ? "SLA actif"
                  : "Aucun SLA personnalisé enregistré"}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Document contractuel</p>
                <p className="text-xs text-muted-foreground">
                  Partagez le PDF signé ou le dossier collaboratif depuis les paramètres.
                </p>
              </div>
              {support?.slaDocumentUrl ? (
                <Button variant="outline" asChild>
                  <a
                    href={support.slaDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Consulter
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button variant="ghost" asChild>
                  <Link href="/dashboard/settings/organization">Ajouter un SLA</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-purple-600" />
            Hébergement &amp; conformité
          </CardTitle>
          <CardDescription>
            Comprenez où vos données sont stockées et comment demander des documents
            d'audit ou de due diligence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="uppercase">
              Région préférée : {compliance?.preferredDataRegion?.toUpperCase() || "EU"}
            </Badge>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {(compliance?.dataRegions ?? ["eu"]).map((region) => (
                <span key={region} className="rounded-full border px-2 py-1 uppercase">
                  {region}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Artefacts disponibles</p>
            {complianceArtifacts.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {complianceArtifacts.map((artifact) => (
                  <li key={artifact}>{artifact}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun document de conformité n'a encore été partagé. Ajoutez vos
                certifications (ISO, SOC 2, RGPD…) dans les paramètres.
              </p>
            )}
          </div>

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Demander des preuves de conformité</p>
              <p className="text-xs text-muted-foreground">
                Utilisez le contact désigné pour recevoir les rapports d'audit,
                questionnaires de sécurité ou annexes contractuelles.
              </p>
            </div>
            {hasComplianceContact ? (
              <Button asChild>
                <a
                  href={`mailto:${compliance?.requestContactEmail}`}
                  className="flex items-center gap-2"
                >
                  Contacter la conformité
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
            ) : (
              <Button variant="ghost" asChild>
                <Link href="/dashboard/settings/organization">
                  Définir un contact conformité
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
