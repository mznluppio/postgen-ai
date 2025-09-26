import { databases, databaseId, COLLECTIONS } from "@/lib/appwrite-config";
import { Query, type Models } from "appwrite";

export interface EngagementMetric extends Models.Document {
  contentId: string;
  organizationId: string;
  views: number;
  clicks: number;
  reactions: number;
  periodStart: string;
  periodEnd?: string;
  source?: string;
}

export interface EngagementTimeseriePoint {
  date: string;
  views: number;
  clicks: number;
  reactions: number;
}

export interface ContentPerformance {
  contentId: string;
  title?: string;
  views: number;
  clicks: number;
  reactions: number;
  engagementRate: number;
  weekOverWeekChange: number;
}

export interface EngagementSummaryCard {
  label: string;
  value: number;
  change: number;
  helper: string;
}

export interface EngagementInsights {
  metrics: EngagementMetric[];
  timeseries: EngagementTimeseriePoint[];
  summaryCards: EngagementSummaryCard[];
  topContent: ContentPerformance[];
  lastUpdated?: string;
  planBenchmark: {
    weeklyViewTarget: number;
    engagementRateTarget: number;
    currentWeeklyViews: number;
    currentEngagementRate: number;
  };
}

const BENCHMARKS: Record<
  "starter" | "pro" | "enterprise",
  { weeklyViewTarget: number; engagementRateTarget: number }
> = {
  starter: { weeklyViewTarget: 500, engagementRateTarget: 2.5 },
  pro: { weeklyViewTarget: 2500, engagementRateTarget: 4 },
  enterprise: { weeklyViewTarget: 6000, engagementRateTarget: 5 },
};

const round = (value: number, decimals = 1) => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

function percentChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

function calculateWeeklyWindow(metrics: EngagementMetric[], weeksAgo: number) {
  const now = new Date();
  const end = new Date(now);
  end.setUTCDate(end.getUTCDate() - weeksAgo * 7);

  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 7);

  return metrics.filter((metric) => {
    const period = new Date(metric.periodStart);
    return period >= start && period < end;
  });
}

function aggregatePeriod(metrics: EngagementMetric[]) {
  return metrics.reduce(
    (acc, metric) => {
      acc.views += metric.views || 0;
      acc.clicks += metric.clicks || 0;
      acc.reactions += metric.reactions || 0;
      return acc;
    },
    { views: 0, clicks: 0, reactions: 0 },
  );
}

function buildTimeseries(metrics: EngagementMetric[]): EngagementTimeseriePoint[] {
  const byDate = new Map<string, EngagementTimeseriePoint>();

  metrics.forEach((metric) => {
    const day = new Date(metric.periodStart).toISOString().slice(0, 10);
    const existing = byDate.get(day) ?? {
      date: day,
      views: 0,
      clicks: 0,
      reactions: 0,
    };

    existing.views += metric.views || 0;
    existing.clicks += metric.clicks || 0;
    existing.reactions += metric.reactions || 0;

    byDate.set(day, existing);
  });

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function buildTopContent(metrics: EngagementMetric[]): ContentPerformance[] {
  const byContent = new Map<string, ContentPerformance>();

  metrics.forEach((metric) => {
    const existing = byContent.get(metric.contentId) ?? {
      contentId: metric.contentId,
      views: 0,
      clicks: 0,
      reactions: 0,
      engagementRate: 0,
      weekOverWeekChange: 0,
    };

    existing.views += metric.views || 0;
    existing.clicks += metric.clicks || 0;
    existing.reactions += metric.reactions || 0;

    const totalInteractions = existing.clicks + existing.reactions;
    existing.engagementRate = existing.views
      ? (totalInteractions / existing.views) * 100
      : 0;

    byContent.set(metric.contentId, existing);
  });

  const lastWeek = calculateWeeklyWindow(metrics, 0);
  const previousWeek = calculateWeeklyWindow(metrics, 1);

  const previousByContent = new Map<string, number>();
  previousWeek.forEach((metric) => {
    previousByContent.set(
      metric.contentId,
      (previousByContent.get(metric.contentId) || 0) + metric.views,
    );
  });

  const currentByContent = new Map<string, number>();
  lastWeek.forEach((metric) => {
    currentByContent.set(
      metric.contentId,
      (currentByContent.get(metric.contentId) || 0) + metric.views,
    );
  });

  byContent.forEach((value, key) => {
    const currentViews = currentByContent.get(key) || 0;
    const prevViews = previousByContent.get(key) || 0;
    value.weekOverWeekChange = percentChange(currentViews, prevViews);
  });

  return Array.from(byContent.values())
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map((item) => ({
      ...item,
      engagementRate: round(item.engagementRate),
      weekOverWeekChange: round(item.weekOverWeekChange ?? 0),
    }));
}

function buildSummaryCards(
  current: { views: number; clicks: number; reactions: number },
  previous: { views: number; clicks: number; reactions: number },
) {
  const currentEngagement = current.views
    ? ((current.clicks + current.reactions) / current.views) * 100
    : 0;
  const previousEngagement = previous.views
    ? ((previous.clicks + previous.reactions) / previous.views) * 100
    : 0;

  return [
    {
      label: "Vues",
      value: current.views,
      change: percentChange(current.views, previous.views),
      helper: "vs. semaine précédente",
    },
    {
      label: "Clics",
      value: current.clicks,
      change: percentChange(current.clicks, previous.clicks),
      helper: "vs. semaine précédente",
    },
    {
      label: "Réactions",
      value: current.reactions,
      change: percentChange(current.reactions, previous.reactions),
      helper: "vs. semaine précédente",
    },
    {
      label: "Taux d'engagement",
      value: currentEngagement,
      change: percentChange(currentEngagement, previousEngagement),
      helper: "(clics + réactions) / vues",
    },
  ];
}

export async function fetchEngagementMetrics(
  organizationId: string,
  limit = 120,
) {
  if (!COLLECTIONS.ENGAGEMENT) {
    throw new Error(
      "La collection d'engagement Appwrite n'est pas configurée (ENGAGEMENT).",
    );
  }

  const response = await databases.listDocuments<EngagementMetric>(
    databaseId,
    COLLECTIONS.ENGAGEMENT,
    [
      Query.equal("organizationId", organizationId),
      Query.orderDesc("periodStart"),
      Query.limit(limit),
    ],
  );

  return response.documents;
}

export function buildEngagementInsights(
  metrics: EngagementMetric[],
  plan: "starter" | "pro" | "enterprise",
): EngagementInsights {
  if (!metrics.length) {
    return {
      metrics,
      timeseries: [],
      summaryCards: buildSummaryCards(
        { views: 0, clicks: 0, reactions: 0 },
        { views: 0, clicks: 0, reactions: 0 },
      ),
      topContent: [],
      lastUpdated: undefined,
      planBenchmark: {
        weeklyViewTarget: BENCHMARKS[plan].weeklyViewTarget,
        engagementRateTarget: BENCHMARKS[plan].engagementRateTarget,
        currentWeeklyViews: 0,
        currentEngagementRate: 0,
      },
    };
  }

  const lastWeekMetrics = calculateWeeklyWindow(metrics, 0);
  const previousWeekMetrics = calculateWeeklyWindow(metrics, 1);

  const currentTotals = aggregatePeriod(lastWeekMetrics);
  const previousTotals = aggregatePeriod(previousWeekMetrics);

  const timeseries = buildTimeseries(metrics);
  const summaryCards = buildSummaryCards(currentTotals, previousTotals).map(
    (card) => ({
      ...card,
      value:
        card.label === "Taux d'engagement"
          ? round(card.value)
          : Math.round(card.value),
      change: round(card.change),
    }),
  );

  const totalInteractions = currentTotals.clicks + currentTotals.reactions;
  const currentEngagementRate = currentTotals.views
    ? (totalInteractions / currentTotals.views) * 100
    : 0;

  const benchmark = BENCHMARKS[plan];

  return {
    metrics,
    timeseries,
    summaryCards,
    topContent: buildTopContent(metrics),
    lastUpdated: metrics[0]?.periodEnd || metrics[0]?.periodStart,
    planBenchmark: {
      weeklyViewTarget: benchmark.weeklyViewTarget,
      engagementRateTarget: benchmark.engagementRateTarget,
      currentWeeklyViews: Math.round(currentTotals.views),
      currentEngagementRate: round(currentEngagementRate),
    },
  };
}

export function buildAnalyticsSummaryPayload(insights: EngagementInsights) {
  const cardSummaries = insights.summaryCards
    .map(
      (card) =>
        `${card.label}: ${card.value} (${card.change >= 0 ? "+" : ""}${round(card.change)}% ${card.helper})`,
    )
    .join("; ");

  const topContentSummary = insights.topContent
    .map(
      (item) =>
        `Contenu ${item.contentId}: ${item.views} vues, ${item.engagementRate}% d'engagement (${item.weekOverWeekChange >= 0 ? "+" : ""}${item.weekOverWeekChange}% vs. S-1)`,
    )
    .join("; ");

  return [cardSummaries, topContentSummary].filter(Boolean).join(" | ");
}
