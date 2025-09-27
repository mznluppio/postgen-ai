"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnalyticsSummaryCards } from "@/components/dashboard/AnalyticsSummaryCards";
import { EngagementPerformanceChart } from "@/components/dashboard/EngagementPerformanceChart";
import { TopContentTable } from "@/components/dashboard/TopContentTable";
import { useEngagementInsights } from "@/hooks/useEngagementInsights";
import { useAnalyticsAvailability } from "@/hooks/useAnalyticsAvailability";
import { buildEngagementInsights, type EngagementMetric } from "@/lib/analytics";
import { type PlanId } from "@/lib/plans";
import { AlertCircle, Loader2 } from "lucide-react";

const numberFormatter = new Intl.NumberFormat("fr-FR");

const TIME_WINDOWS = [
  { label: "7 jours", value: "7" },
  { label: "30 jours", value: "30" },
  { label: "90 jours", value: "90" },
];

function computeChannelPerformance(metrics: EngagementMetric[]) {
  const totals = metrics.reduce(
    (acc, metric) => {
      const key = metric.source || "Autre";
      if (!acc.map.has(key)) {
        acc.map.set(key, {
          source: key,
          views: 0,
          clicks: 0,
          reactions: 0,
        });
      }

      const entry = acc.map.get(key)!;
      entry.views += metric.views ?? 0;
      entry.clicks += metric.clicks ?? 0;
      entry.reactions += metric.reactions ?? 0;

      acc.totalViews += metric.views ?? 0;
      return acc;
    },
    { map: new Map<string, { source: string; views: number; clicks: number; reactions: number }>(), totalViews: 0 },
  );

  return Array.from(totals.map.values()).map((entry) => {
    const engagementRate = entry.views
      ? ((entry.clicks + entry.reactions) / entry.views) * 100
      : 0;
    const trafficShare = totals.totalViews
      ? (entry.views / totals.totalViews) * 100
      : 0;

    return {
      ...entry,
      engagementRate,
      trafficShare,
    };
  });
}

export default function AnalyticsPage() {
  const { currentOrganization } = useAuth();
  const {
    insights,
    loading,
    error,
    planDetails,
    analyticsSummary,
    refresh,
  } = useEngagementInsights();
  const {
    hasAnalyticsAccess,
    loading: loadingIntegrations,
    error: integrationsError,
    requiredIntegrationLabels,
  } = useAnalyticsAvailability();
  const [timeWindow, setTimeWindow] = useState<string>(TIME_WINDOWS[1]?.value ?? "30");
  const [channelFilter, setChannelFilter] = useState<string>("all");

  const availableSources = useMemo(() => {
    const sources = new Set<string>();
    (insights?.metrics ?? []).forEach((metric) => {
      if (metric.source) {
        sources.add(metric.source);
      }
    });
    return Array.from(sources).sort((a, b) => a.localeCompare(b));
  }, [insights?.metrics]);

  const filteredMetrics = useMemo(() => {
    if (!insights?.metrics?.length) {
      return [] as EngagementMetric[];
    }

    const days = Number.parseInt(timeWindow, 10) || 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return insights.metrics.filter((metric) => {
      const date = new Date(metric.periodStart);
      const matchesDate = date >= cutoff;
      const matchesChannel =
        channelFilter === "all" || (metric.source ?? "").toLowerCase() === channelFilter;
      return matchesDate && matchesChannel;
    });
  }, [channelFilter, insights?.metrics, timeWindow]);

  const derivedInsights = useMemo(() => {
    if (!currentOrganization) return null;
    const plan = (currentOrganization.plan ?? "starter") as PlanId;
    if (!filteredMetrics.length) {
      return null;
    }
    return buildEngagementInsights(filteredMetrics, plan);
  }, [currentOrganization, filteredMetrics]);

  const summaryCards = derivedInsights?.summaryCards ?? insights?.summaryCards ?? [];
  const timeseries = derivedInsights?.timeseries ?? insights?.timeseries ?? [];
  const topContent = derivedInsights?.topContent ?? insights?.topContent ?? [];
  const lastUpdated = derivedInsights?.lastUpdated ?? insights?.lastUpdated;

  const channelPerformance = useMemo(
    () => computeChannelPerformance(filteredMetrics.length ? filteredMetrics : insights?.metrics ?? []),
    [filteredMetrics, insights?.metrics],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics détaillées</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Analysez vos performances d'engagement sur mesure : filtres temporels, segmentation par canal et classements détaillés.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {planDetails && <Badge variant="secondary">Plan {planDetails.name}</Badge>}
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading || !hasAnalyticsAccess}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Actualisation…
              </>
            ) : (
              "Rafraîchir"
            )}
          </Button>
        </div>
      </div>

      {integrationsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Impossible de charger les intégrations</AlertTitle>
          <AlertDescription>{integrationsError}</AlertDescription>
        </Alert>
      )}

      {loadingIntegrations ? (
        <div className="flex items-center gap-2 rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Vérification des intégrations…</span>
        </div>
      ) : !hasAnalyticsAccess ? (
        <Card>
          <CardHeader>
            <CardTitle>Connectez vos canaux sociaux</CardTitle>
            <CardDescription>
              Ajoutez vos clés {requiredIntegrationLabels.join(", ")} dans les intégrations pour débloquer l'analytics.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/dashboard/settings/integrations">Aller aux intégrations</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Configuration des filtres</CardTitle>
              <CardDescription>
                Ajustez la période analysée et la source de vos données pour obtenir des insights ciblés.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase text-muted-foreground">
                  Période d'analyse
                </label>
                <Select value={timeWindow} onValueChange={setTimeWindow}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une période" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_WINDOWS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase text-muted-foreground">
                  Canal
                </label>
                <Select value={channelFilter} onValueChange={setChannelFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les canaux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les canaux</SelectItem>
                    {availableSources.map((source) => (
                      <SelectItem key={source} value={source.toLowerCase()}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase text-muted-foreground">
                  Synthèse IA
                </label>
                <Card className="border bg-muted/40">
                  <CardContent className="p-3 text-xs text-muted-foreground">
                    {analyticsSummary
                      ? analyticsSummary.slice(0, 180) + (analyticsSummary.length > 180 ? "…" : "")
                      : "Générez du contenu pour alimenter la synthèse analytique."}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Impossible de charger les métriques</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AnalyticsSummaryCards cards={summaryCards} />

          <div className="grid gap-4 lg:grid-cols-3">
            <EngagementPerformanceChart data={timeseries} loading={loading} />
            <Card>
              <CardHeader>
                <CardTitle>Vue d'ensemble</CardTitle>
                <CardDescription>
                  Dernière mise à jour et volume de données disponibles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Dernière activité</p>
                  <p className="font-medium">
                    {lastUpdated
                      ? new Date(lastUpdated).toLocaleString()
                      : "Aucune donnée récente"}
                  </p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Période filtrée</p>
                  <p className="font-medium">
                    {TIME_WINDOWS.find((option) => option.value === timeWindow)?.label || "30 jours"}
                  </p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Volume de métriques</p>
                  <p className="font-medium">
                    {numberFormatter.format((filteredMetrics.length || insights?.metrics?.length || 0))} points suivis
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance par canal</CardTitle>
                <CardDescription>
                  Identifiez les canaux générant le plus d'engagement sur la période sélectionnée.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {channelPerformance.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Canal</TableHead>
                        <TableHead className="text-right">Vues</TableHead>
                        <TableHead className="text-right">Clics</TableHead>
                        <TableHead className="text-right">Réactions</TableHead>
                        <TableHead className="text-right">Taux d'engagement</TableHead>
                        <TableHead className="text-right">Part de trafic</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {channelPerformance.map((channel) => (
                        <TableRow key={channel.source}>
                          <TableCell className="font-medium">{channel.source}</TableCell>
                          <TableCell className="text-right">
                            {numberFormatter.format(Math.round(channel.views))}
                          </TableCell>
                          <TableCell className="text-right">
                            {numberFormatter.format(Math.round(channel.clicks))}
                          </TableCell>
                          <TableCell className="text-right">
                            {numberFormatter.format(Math.round(channel.reactions))}
                          </TableCell>
                          <TableCell className="text-right">
                            {channel.engagementRate.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right">
                            {channel.trafficShare.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="py-8 text-sm text-muted-foreground text-center">
                    Aucune métrique disponible pour cette sélection.
                  </p>
                )}
              </CardContent>
            </Card>

            <TopContentTable items={topContent} loading={loading} />
          </div>
        </>
      )}
    </div>
  );
}
