"use client";

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
  Loader2,
  Sparkles,
  Mail,
  Phone,
  MessageCircle,
  LifeBuoy,
} from "lucide-react";
import { CreateOrganizationDialog } from "@/components/dashboard/CreateOrganizationDialog";
import AuthPage from "../auth/page";
import { useEngagementInsights } from "@/hooks/useEngagementInsights";
import { AnalyticsSummaryCards } from "@/components/dashboard/AnalyticsSummaryCards";
import { EngagementPerformanceChart } from "@/components/dashboard/EngagementPerformanceChart";
import { TopContentTable } from "@/components/dashboard/TopContentTable";

const numberFormatter = new Intl.NumberFormat("fr-FR");

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
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-2">
          Bienvenue, {user?.name} ! 👋
        </h1>
        <p className="text-muted-foreground mb-4">
          Vous êtes dans l'organisation <strong>{currentOrganization.name}</strong>. Créez du contenu exceptionnel avec l'IA.
        </p>
        <Button asChild>
          <a href="/generate">
            <Sparkles className="mr-2 h-4 w-4" />
            Créer du contenu
          </a>
        </Button>
      </div>

      {metricsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur de métriques</AlertTitle>
          <AlertDescription>{metricsError}</AlertDescription>
        </Alert>
      )}

      <AnalyticsSummaryCards cards={insights?.summaryCards ?? []} />

      <div className="grid gap-4 lg:grid-cols-3">
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
            <div>
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Vues hebdomadaires</span>
                <span>
                  {benchmark ? numberFormatter.format(benchmark.currentWeeklyViews) : 0}
                  <span className="text-muted-foreground">
                    {" "}/ {numberFormatter.format(benchmark?.weeklyViewTarget ?? 0)}
                  </span>
                </span>
              </div>
              <Progress value={weeklyProgress} className="mt-2" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Taux d'engagement</span>
                <span>
                  {benchmark ? `${benchmark.currentEngagementRate}%` : "0%"}
                  <span className="text-muted-foreground">
                    {" "}/ {benchmark ? `${benchmark.engagementRateTarget}%` : "0%"}
                  </span>
                </span>
              </div>
              <Progress value={engagementProgress} className="mt-2" />
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
      </div>

      <TopContentTable items={insights?.topContent ?? []} loading={loadingMetrics} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
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
