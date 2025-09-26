"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  ArrowUpRight,
  BarChart2,
  Calendar,
  FileText,
  Loader2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Mail,
  Phone,
  MessageCircle,
  LifeBuoy,
} from "lucide-react";
import { CreateOrganizationDialog } from "@/components/dashboard/CreateOrganizationDialog";
import AuthPage from "../auth/page";
import { PRICING_PLANS_BY_ID, type PlanId } from "@/lib/plans";
import {
  fetchEngagementMetrics,
  buildEngagementInsights,
  buildAnalyticsSummaryPayload,
  type EngagementInsights,
} from "@/lib/analytics";

const numberFormatter = new Intl.NumberFormat("fr-FR");

const chartConfig = {
  views: {
    label: "Vues",
    color: "#2563EB",
  },
  clicks: {
    label: "Clics",
    color: "#F97316",
  },
  reactions: {
    label: "Réactions",
    color: "#8B5CF6",
  },
};

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
  const [insights, setInsights] = useState<EngagementInsights | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!currentOrganization) {
      return;
    }

    let cancelled = false;
    setLoadingMetrics(true);
    setMetricsError(null);

    const plan = (currentOrganization.plan ?? "starter") as PlanId;

    fetchEngagementMetrics(currentOrganization.$id)
      .then((metrics) => {
        if (cancelled) return;
        setInsights(buildEngagementInsights(metrics, plan));
      })
      .catch((error: unknown) => {
        console.error("Erreur lors du chargement des métriques", error);
        if (cancelled) return;
        setMetricsError(
          "Impossible de charger les métriques d'engagement. Vérifiez la configuration Appwrite.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingMetrics(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentOrganization]);

  const planDetails = currentOrganization
    ? PRICING_PLANS_BY_ID[(currentOrganization.plan ?? "starter") as PlanId]
    : null;

  const analyticsSummary = useMemo(() => {
    if (!insights) return "";
    return buildAnalyticsSummaryPayload(insights);
  }, [insights]);

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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(insights?.summaryCards || []).map((card) => {
          const positive = card.change >= 0;
          return (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-medium">
                    {card.label}
                  </CardTitle>
                  <CardDescription>{card.helper}</CardDescription>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${positive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                >
                  {formatChange(card.change)}
                </span>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">
                    {formatSummaryValue(card.label, card.value)}
                  </div>
                  {positive ? (
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-rose-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance d'engagement</CardTitle>
            <CardDescription>
              Suivez l'évolution des vues, clics et réactions sur vos contenus.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {loadingMetrics ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Chargement des métriques...
              </div>
            ) : insights?.timeseries?.length ? (
              <ChartContainer config={chartConfig} className="h-full">
                <AreaChart data={insights.timeseries}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="var(--color-views)"
                    fill="var(--color-views)"
                    fillOpacity={0.15}
                    name="Vues"
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="var(--color-clicks)"
                    fill="var(--color-clicks)"
                    fillOpacity={0.15}
                    name="Clics"
                  />
                  <Area
                    type="monotone"
                    dataKey="reactions"
                    stroke="var(--color-reactions)"
                    fill="var(--color-reactions)"
                    fillOpacity={0.15}
                    name="Réactions"
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center">
                <BarChart2 className="h-10 w-10 mb-3" />
                <p>Aucune donnée d'engagement disponible pour le moment.</p>
                <p className="text-sm">
                  Publiez du contenu pour commencer à suivre vos performances.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

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

      <Card>
        <CardHeader>
          <CardTitle>Top contenus</CardTitle>
          <CardDescription>
            Classement des contenus les plus performants sur la période suivie.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingMetrics ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Chargement des données…
            </div>
          ) : insights?.topContent?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contenu</TableHead>
                  <TableHead className="text-right">Vues</TableHead>
                  <TableHead className="text-right">Clics</TableHead>
                  <TableHead className="text-right">Réactions</TableHead>
                  <TableHead className="text-right">Taux d'engagement</TableHead>
                  <TableHead className="text-right">Évolution S-1</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insights.topContent.map((item) => (
                  <TableRow key={item.contentId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {item.title || item.contentId}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {numberFormatter.format(item.views)}
                    </TableCell>
                    <TableCell className="text-right">
                      {numberFormatter.format(item.clicks)}
                    </TableCell>
                    <TableCell className="text-right">
                      {numberFormatter.format(item.reactions)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.engagementRate}%
                    </TableCell>
                    <TableCell className="text-right">
                      {item.weekOverWeekChange >= 0 ? "+" : ""}
                      {item.weekOverWeekChange}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-3 opacity-60" />
              <p>Aucun contenu n'a encore généré d'engagement mesurable.</p>
              <p className="text-sm">
                Lancez une campagne depuis l'onglet Génération pour alimenter ce tableau.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
