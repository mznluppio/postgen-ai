"use client";

import Link from "next/link";
import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  FolderOpen,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
  LifeBuoy,
} from "lucide-react";
import { CreateOrganizationDialog } from "@/components/dashboard/CreateOrganizationDialog";
import AuthPage from "../auth/page";
import { useEngagementInsights } from "@/hooks/useEngagementInsights";
import { EngagementPerformanceChart } from "@/components/dashboard/EngagementPerformanceChart";
import { TopContentTable } from "@/components/dashboard/TopContentTable";

const numberFormatter = new Intl.NumberFormat("fr-FR");

function formatSummaryValue(label: string, value: number) {
  if (label === "Taux d'engagement") {
    return `${value}%`;
  }

  return numberFormatter.format(value);
}

function formatChange(change: number) {
  const rounded = Math.abs(change).toFixed(1);
  return `${change >= 0 ? "+" : "-"}${rounded}%`;
}

export default function Dashboard() {
  const { user, currentOrganization } = useAuth();
  const {
    insights,
    loading: loadingMetrics,
    error: metricsError,
    planDetails,
    analyticsSummary,
  } = useEngagementInsights();
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(
    null,
  );

  const handleGenerateRecommendations = async () => {
    if (!currentOrganization || !planDetails || !analyticsSummary) {
      return;
    }

    setLoadingRecommendations(true);
    setRecommendationError(null);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analyticsSummary,
          planName: planDetails.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();
      setRecommendations(data.suggestions ?? []);
    } catch (error) {
      console.error("Erreur lors de la génération des recommandations", error);
      setRecommendationError(
        "Impossible de générer des recommandations pour le moment.",
      );
    } finally {
      setLoadingRecommendations(false);
    }
  };

  if (!currentOrganization) {
    return (
      <AuthGuard fallback={<AuthPage />}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Bienvenue sur Postgen AI</CardTitle>
              <CardDescription>
                Créez votre première organisation pour commencer à générer du
                contenu
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <CreateOrganizationDialog />
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  const support = currentOrganization.supportCenter;
  const compliance = currentOrganization.compliance;
  const isEnterprise = currentOrganization.plan === "enterprise";

  const quickActions = [
    {
      label: "Générer du contenu",
      description: "Créez un post ou une campagne en quelques clics.",
      href: "/generate",
      icon: Sparkles,
    },
    {
      label: "Bibliothèque de contenus",
      description: "Retrouvez vos brouillons et publications.",
      href: "/dashboard/library",
      icon: FolderOpen,
    },
    {
      label: "Analyser les performances",
      description: "Explorez les métriques détaillées et tendances.",
      href: "/dashboard/analytics",
      icon: BarChart3,
    },
  ] as const;

  const keyHighlights = (insights?.summaryCards ?? []).slice(0, 3);

  const benchmark = insights?.planBenchmark;
  const weeklyProgress = benchmark?.weeklyViewTarget
    ? Math.min(
        100,
        Math.round(
          (benchmark.currentWeeklyViews / benchmark.weeklyViewTarget) * 100,
        ),
      )
    : 0;
  const engagementProgress = benchmark?.engagementRateTarget
    ? Math.min(
        100,
        Math.round(
          (benchmark.currentEngagementRate / benchmark.engagementRateTarget) *
            100,
        ),
      )
    : 0;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">
              Bienvenue, {user?.name} ! 👋
            </CardTitle>
            <CardDescription>
              Vous êtes dans l'organisation <strong>{currentOrganization.name}</strong>. Accédez rapidement aux actions essentielles pour garder le cap.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="uppercase">
                Plan {planDetails?.name ?? currentOrganization.plan}
              </Badge>
              {planDetails?.price && <span>{planDetails.price}</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <a href="/generate">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Créer du contenu
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/dashboard/projects">Voir mes projets</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Priorités du moment</CardTitle>
            <CardDescription>
              Trois points d'entrée pour garder votre flux de travail simple et efficace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <li key={action.href}>
                    <Link
                      href={action.href}
                      className="group flex items-center justify-between gap-4 rounded-lg border bg-card/60 p-3 transition hover:border-primary"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <Icon className="h-5 w-5 text-primary" />
                        </span>
                        <div>
                          <p className="text-sm font-medium">{action.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </section>

      {metricsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur de métriques</AlertTitle>
          <AlertDescription>{metricsError}</AlertDescription>
        </Alert>
      )}

      {keyHighlights.length > 0 && (
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Indicateurs clés</CardTitle>
              <CardDescription>
                Suivi rapide de vos signaux les plus utiles cette semaine.
              </CardDescription>
            </div>
            <span className="text-xs text-muted-foreground">
              Basé sur vos dernières métriques consolidées
            </span>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {keyHighlights.map((card) => {
                const positive = card.change >= 0;
                return (
                  <div
                    key={card.label}
                    className="rounded-lg border bg-muted/40 p-4"
                  >
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {formatSummaryValue(card.label, card.value)}
                    </p>
                    <p
                      className={`mt-3 text-xs font-medium ${positive ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {formatChange(card.change)} vs S-1
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {card.helper}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-4 xl:grid-cols-3">
        <EngagementPerformanceChart
          data={insights?.timeseries ?? []}
          loading={loadingMetrics}
        />

        <Card>
          <CardHeader>
            <CardTitle>Objectifs du plan {planDetails?.name}</CardTitle>
            <CardDescription>
              Comparez vos performances hebdomadaires aux repères du plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Vues hebdomadaires</span>
                <span>
                  {benchmark
                    ? numberFormatter.format(benchmark.currentWeeklyViews)
                    : 0}
                  <span className="text-muted-foreground">
                    {" "}/ {numberFormatter.format(benchmark?.weeklyViewTarget ?? 0)}
                  </span>
                </span>
              </div>
              <Progress value={weeklyProgress} className="h-2" />
            </div>
            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Taux d'engagement</span>
                <span>
                  {benchmark ? `${benchmark.currentEngagementRate}%` : "0%"}
                  <span className="text-muted-foreground">
                    {" "}/ {benchmark ? `${benchmark.engagementRateTarget}%` : "0%"}
                  </span>
                </span>
              </div>
              <Progress value={engagementProgress} className="h-2" />
            </div>
            {planDetails?.price && (
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                <p>
                  {planDetails.name} · {planDetails.price}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr] xl:items-start">
        <TopContentTable
          items={insights?.topContent ?? []}
          loading={loadingMetrics}
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Recommandations IA</CardTitle>
              <CardDescription>
                Suggestions d'optimisation basées sur vos métriques récentes et votre plan.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateRecommendations}
              disabled={loadingRecommendations || !insights?.metrics?.length}
            >
              {loadingRecommendations ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération…
                </>
              ) : (
                <>
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Générer
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {!insights?.metrics?.length ? (
              <p className="text-sm text-muted-foreground">
                Publiez du contenu et revenez pour obtenir des recommandations personnalisées.
              </p>
            ) : loadingRecommendations ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyse des métriques…
              </div>
            ) : recommendationError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Recommandations indisponibles</AlertTitle>
                <AlertDescription>{recommendationError}</AlertDescription>
              </Alert>
            ) : recommendations.length ? (
              <ul className="space-y-3 text-sm">
                {recommendations.map((suggestion, index) => (
                  <li
                    key={`${suggestion}-${index}`}
                    className="flex items-start gap-2 rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 p-3"
                  >
                    <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground">
                Cliquez sur « Générer » pour obtenir des pistes d'amélioration ciblées.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {isEnterprise && (
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-purple-600" />
                Support prioritaire
              </CardTitle>
              <CardDescription>
                Accédez rapidement à vos canaux Enterprise et à vos engagements SLA.
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <a href="/dashboard/support">Ouvrir le centre de support</a>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-purple-600" />
                Email prioritaire
              </div>
              <p className="text-sm font-medium">
                {support?.priorityEmail || "Configurez un email prioritaire dans les paramètres"}
              </p>
              {support?.slackChannel && (
                <p className="text-xs text-muted-foreground">
                  Canal Slack : {support.slackChannel}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-purple-600" />
                Ligne directe
              </div>
              <p className="text-sm font-medium">
                {support?.priorityPhone || "Ajoutez une ligne directe pour vos incidents critiques"}
              </p>
              {support?.ticketPortalUrl && (
                <p className="text-xs text-muted-foreground">
                  Portail : {support.ticketPortalUrl.replace(/^https?:\/\//, "")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4 text-purple-600" />
                Engagement SLA
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="uppercase">
                  {support?.slaTier || "Non défini"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Région prioritaire : {compliance?.preferredDataRegion?.toUpperCase() || "EU"}
                </span>
              </div>
              {support?.slaDocumentUrl ? (
                <a
                  href={support.slaDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 hover:underline"
                >
                  Consulter le document SLA
                </a>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Ajoutez votre SLA pour le partager avec les équipes.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
