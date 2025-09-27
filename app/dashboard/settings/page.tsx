"use client";

import Link from "next/link";
import { ArrowRight, Building2, CreditCard, Plug, Settings as SettingsIcon, UserCog, Users } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLAN_LABELS } from "@/lib/plans";

const SETTINGS_SECTIONS = [
  {
    title: "Paramètres du compte",
    description:
      "Gérez vos informations personnelles, vos préférences linguistiques et vos notifications.",
    href: "/dashboard/settings/account",
    icon: UserCog,
    actionLabel: "Configurer",
  },
  {
    title: "Organisation",
    description:
      "Mettez à jour le profil de l'organisation, les canaux de support et les options de conformité.",
    href: "/dashboard/settings/organization",
    icon: Building2,
    actionLabel: "Modifier",
  },
  {
    title: "Équipe",
    description:
      "Invitez de nouveaux membres, gérez les rôles et surveillez la capacité de votre plan.",
    href: "/dashboard/settings/team",
    icon: Users,
    actionLabel: "Gérer",
  },
  {
    title: "Abonnement & facturation",
    description:
      "Mettez à niveau votre plan, mettez à jour les informations de facturation et accédez aux factures.",
    href: "/dashboard/settings/billing",
    icon: CreditCard,
    actionLabel: "Ouvrir",
  },
  {
    title: "Intégrations",
    description:
      "Connectez vos comptes sociaux et outils marketing pour automatiser vos flux de travail.",
    href: "/dashboard/settings/integrations",
    icon: Plug,
    actionLabel: "Configurer",
  },
  {
    title: "Préférences globales",
    description:
      "Ajustez les politiques de publication, les validations automatiques et l'expérience équipe.",
    href: "/dashboard/settings/organization#policies",
    icon: SettingsIcon,
    actionLabel: "Ajuster",
  },
];

export default function SettingsOverviewPage() {
  const { currentOrganization } = useAuth();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Centre de paramètres</h1>
        <p className="text-sm text-muted-foreground">
          Centralisez la gestion de votre compte, de votre organisation et de votre abonnement.
        </p>
      </div>

      <Separator />

      {currentOrganization && (
        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Résumé de l'abonnement</CardTitle>
              <CardDescription>
                Vous êtes actuellement sur le plan {""}
                <span className="capitalize">
                  {PLAN_LABELS[currentOrganization.plan]}
                </span>
                .
              </CardDescription>
            </div>
            <Badge variant="outline" className="capitalize">
              {PLAN_LABELS[currentOrganization.plan]}
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Organisation</p>
              <p className="font-medium">{currentOrganization.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Renouvellement</p>
              <p className="font-medium">
                {currentOrganization.billing?.planRenewalDate
                  ? new Date(currentOrganization.billing.planRenewalDate).toLocaleDateString()
                  : "À définir"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Membres</p>
              <p className="font-medium">{currentOrganization.members.length}</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              Besoin de plus de capacité ou de fonctionnalités avancées ?
            </div>
            <Button asChild>
              <Link href="/dashboard/settings/billing" className="inline-flex items-center gap-2">
                Gérer l'abonnement
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SETTINGS_SECTIONS.map((section) => (
          <Card key={section.href} className="flex flex-col">
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="rounded-lg border bg-muted/40 p-2">
                <section.icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </div>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Button asChild variant="ghost" className="ml-auto inline-flex items-center gap-2">
                <Link href={section.href}>
                  {section.actionLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
