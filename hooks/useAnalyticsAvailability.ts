"use client";

import { useMemo } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useOrganizationIntegrations } from "@/hooks/useOrganizationIntegrations";

const REQUIRED_ANALYTICS_INTEGRATIONS = ["linkedin", "instagram", "email"] as const;
const REQUIRED_INTEGRATION_LABELS: Record<
  (typeof REQUIRED_ANALYTICS_INTEGRATIONS)[number],
  string
> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  email: "E-mail",
};

type RequiredAnalyticsIntegration = (typeof REQUIRED_ANALYTICS_INTEGRATIONS)[number];

interface UseAnalyticsAvailabilityResult {
  hasAnalyticsAccess: boolean;
  loading: boolean;
  error: string | null;
  integrations: ReturnType<typeof useOrganizationIntegrations>["integrations"];
  requiredIntegrations: RequiredAnalyticsIntegration[];
  requiredIntegrationLabels: string[];
}

export function useAnalyticsAvailability(): UseAnalyticsAvailabilityResult {
  const { currentOrganization } = useAuth();
  const integrationState = useOrganizationIntegrations(currentOrganization);

  const hasAnalyticsAccess = useMemo(() => {
    if (!currentOrganization) {
      return false;
    }

    return REQUIRED_ANALYTICS_INTEGRATIONS.some((integrationId) =>
      integrationState.integrations.some(
        (integration) =>
          integration.integration === integrationId &&
          integration.status === "connected",
      ),
    );
  }, [currentOrganization, integrationState.integrations]);

  return {
    hasAnalyticsAccess,
    loading: integrationState.loading,
    error: integrationState.error,
    integrations: integrationState.integrations,
    requiredIntegrations: [...REQUIRED_ANALYTICS_INTEGRATIONS],
    requiredIntegrationLabels: REQUIRED_ANALYTICS_INTEGRATIONS.map(
      (id) => REQUIRED_INTEGRATION_LABELS[id],
    ),
  };
}
