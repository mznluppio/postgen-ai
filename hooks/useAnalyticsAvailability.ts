"use client";

import { useFeatureGate } from "@/hooks/useFeatureGate";
import type { IntegrationDocument } from "@/lib/integrations";

export interface UseAnalyticsAvailabilityResult {
  hasAnalyticsAccess: boolean;
  hasPlanAccess: boolean;
  requiredPlanLabel: string | null;
  currentPlanLabel: string;
  loading: boolean;
  error: string | null;
  integrations: IntegrationDocument[];
  requiredIntegrations: string[];
  requiredIntegrationLabels: string[];
  missingIntegrationLabels: string[];
}

export function useAnalyticsAvailability(): UseAnalyticsAvailabilityResult {
  const gate = useFeatureGate("analytics");

  return {
    hasAnalyticsAccess: gate.hasAccess,
    hasPlanAccess: gate.hasPlanAccess,
    requiredPlanLabel: gate.requiredPlanLabel,
    currentPlanLabel: gate.currentPlanLabel,
    loading: gate.loading,
    error: gate.error,
    integrations: gate.integrations,
    requiredIntegrations: gate.requiredIntegrations,
    requiredIntegrationLabels: gate.requiredIntegrationLabels,
    missingIntegrationLabels: gate.missingIntegrationLabels,
  };
}
