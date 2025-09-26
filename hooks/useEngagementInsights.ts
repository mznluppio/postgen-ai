"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildAnalyticsSummaryPayload,
  buildEngagementInsights,
  fetchEngagementMetrics,
  type EngagementInsights,
} from "@/lib/analytics";
import { PRICING_PLANS_BY_ID, type PlanId } from "@/lib/plans";

type PlanDetails = (typeof PRICING_PLANS_BY_ID)[PlanId];

interface UseEngagementInsightsResult {
  insights: EngagementInsights | null;
  loading: boolean;
  error: string | null;
  planDetails: PlanDetails | null;
  analyticsSummary: string;
  refresh: () => Promise<void>;
}

export function useEngagementInsights(): UseEngagementInsightsResult {
  const { currentOrganization } = useAuth();
  const [insights, setInsights] = useState<EngagementInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planId = (currentOrganization?.plan ?? "starter") as PlanId;
  const planDetails = currentOrganization
    ? PRICING_PLANS_BY_ID[planId]
    : null;

  const refresh = useCallback(async () => {
    if (!currentOrganization) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const metrics = await fetchEngagementMetrics(currentOrganization.$id);
      setInsights(buildEngagementInsights(metrics, planId));
    } catch (err) {
      console.error("Erreur lors du chargement des métriques", err);
      setError(
        "Impossible de charger les métriques d'engagement. Vérifiez la configuration Appwrite.",
      );
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, planId]);

  useEffect(() => {
    if (!currentOrganization) {
      setInsights(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchEngagementMetrics(currentOrganization.$id)
      .then((metrics) => {
        if (cancelled) return;
        setInsights(buildEngagementInsights(metrics, planId));
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des métriques", err);
        if (cancelled) return;
        setError(
          "Impossible de charger les métriques d'engagement. Vérifiez la configuration Appwrite.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentOrganization, planId]);

  const analyticsSummary = useMemo(() => {
    if (!insights) return "";
    return buildAnalyticsSummaryPayload(insights);
  }, [insights]);

  return {
    insights,
    loading,
    error,
    planDetails: planDetails ?? null,
    analyticsSummary,
    refresh,
  };
}
