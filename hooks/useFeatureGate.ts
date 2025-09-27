"use client";

import { useMemo } from "react";

import { useAuth } from "@/contexts/AuthContext";
import {
  FEATURE_GATES,
  evaluateFeatureAvailability,
  formatList,
  type FeatureRequirements,
  type FeatureKey,
  INTEGRATION_LABELS,
} from "@/lib/feature-gates";
import { PLAN_LABELS, type Plan } from "@/lib/plans";
import {
  useOrganizationIntegrations,
  type UseOrganizationIntegrationsResult,
} from "@/hooks/useOrganizationIntegrations";
import type { IntegrationDocument } from "@/lib/integrations";

export interface FeatureGateResult {
  hasAccess: boolean;
  hasPlanAccess: boolean;
  hasRequiredIntegrations: boolean;
  missingIntegrations: string[];
  missingIntegrationLabels: string[];
  requiredIntegrations: string[];
  requiredIntegrationLabels: string[];
  requiredPlanLabel: string | null;
  currentPlanLabel: string;
  loading: boolean;
  error: string | null;
  integrations: IntegrationDocument[];
  requirements: FeatureRequirements;
}

interface UseFeatureGateOptions {
  integrationState?: UseOrganizationIntegrationsResult;
}

export function useFeatureGate(
  requirementsOrKey: FeatureRequirements | FeatureKey,
  options?: UseFeatureGateOptions,
): FeatureGateResult {
  const requirements =
    typeof requirementsOrKey === "string"
      ? FEATURE_GATES[requirementsOrKey]
      : requirementsOrKey;

  const { currentOrganization } = useAuth();
  const integrationState =
    options?.integrationState ?? useOrganizationIntegrations(currentOrganization);

  const plan = (currentOrganization?.plan ?? "starter") as Plan;

  const evaluation = useMemo(
    () =>
      evaluateFeatureAvailability(
        plan,
        integrationState.integrations,
        requirements,
      ),
    [plan, integrationState.integrations, requirements],
  );

  const requiredPlanLabel = requirements.minimumPlan
    ? PLAN_LABELS[requirements.minimumPlan]
    : null;

  const requiredIntegrations = requirements.requiredIntegrations ?? [];
  const requiredIntegrationLabels = useMemo(
    () =>
      requiredIntegrations.map((id) => INTEGRATION_LABELS[id] ?? id),
    [requiredIntegrations],
  );

  const missingIntegrationLabels = useMemo(
    () =>
      evaluation.missingIntegrations.map((id) => INTEGRATION_LABELS[id] ?? id),
    [evaluation.missingIntegrations],
  );

  return {
    ...evaluation,
    loading: integrationState.loading,
    error: integrationState.error,
    integrations: integrationState.integrations,
    requiredPlanLabel,
    currentPlanLabel: PLAN_LABELS[plan],
    requiredIntegrations,
    requiredIntegrationLabels,
    missingIntegrations: evaluation.missingIntegrations,
    missingIntegrationLabels,
    requirements,
  };
}

export function formatFeatureGateTooltip(result: FeatureGateResult): string | undefined {
  const reasons: string[] = [];

  if (!result.hasPlanAccess && result.requiredPlanLabel) {
    reasons.push(`Disponible avec le plan ${result.requiredPlanLabel}`);
  }

  if (!result.hasRequiredIntegrations && result.requiredIntegrations.length > 0) {
    const formatted = formatList(result.missingIntegrationLabels);
    if (formatted) {
      reasons.push(`Connectez ${formatted} dans les intégrations`);
    }
  }

  return reasons.length ? reasons.join(". ") : undefined;
}
