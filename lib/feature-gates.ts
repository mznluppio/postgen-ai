import { type Plan, isPlanAtLeast } from "@/lib/plans";
import type { IntegrationDocument } from "@/lib/integrations";

export interface FeatureRequirements {
  minimumPlan?: Plan;
  requiredIntegrations?: string[];
}

export interface FeatureAvailability {
  hasPlanAccess: boolean;
  hasRequiredIntegrations: boolean;
  missingIntegrations: string[];
  hasAccess: boolean;
}

export const INTEGRATION_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  email: "E-mail",
  notion: "Notion",
  hubspot: "HubSpot",
  slack: "Slack",
  zapier: "Zapier",
  salesforce: "Salesforce",
};

export function formatList(items: string[], conjunction = "et"): string {
  if (!items.length) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  const head = items.slice(0, -1).join(", ");
  const tail = items[items.length - 1];
  return `${head} ${conjunction} ${tail}`;
}

export function formatIntegrationIds(
  integrationIds: string[],
  conjunction = "et",
): string {
  const labels = integrationIds.map((id) => INTEGRATION_LABELS[id] ?? id);
  return formatList(labels, conjunction);
}

export function evaluateFeatureAvailability(
  plan: Plan,
  integrations: IntegrationDocument[],
  requirements: FeatureRequirements,
): FeatureAvailability {
  const hasPlanAccess = requirements.minimumPlan
    ? isPlanAtLeast(plan, requirements.minimumPlan)
    : true;

  const requiredIntegrations = requirements.requiredIntegrations ?? [];
  const missingIntegrations = requiredIntegrations.filter((integrationId) =>
    integrations.every(
      (integration) =>
        integration.integration !== integrationId ||
        integration.status !== "connected",
    ),
  );

  const hasRequiredIntegrations = missingIntegrations.length === 0;

  return {
    hasPlanAccess,
    hasRequiredIntegrations,
    missingIntegrations,
    hasAccess: hasPlanAccess && hasRequiredIntegrations,
  };
}

export const FEATURE_GATES = {
  analytics: {
    minimumPlan: "pro",
    requiredIntegrations: ["linkedin", "instagram", "email"],
  },
  calendar: {
    minimumPlan: "pro",
    requiredIntegrations: ["linkedin", "instagram", "email"],
  },
  automation: {
    minimumPlan: "pro",
    requiredIntegrations: ["linkedin", "instagram", "email"],
  },
  audiences: {
    minimumPlan: "pro",
  },
  aiModels: {
    minimumPlan: "enterprise",
  },
  brand: {
    minimumPlan: "starter",
  },
  ideas: {
    minimumPlan: "starter",
  },
} as const satisfies Record<string, FeatureRequirements>;

export type FeatureKey = keyof typeof FEATURE_GATES;

export function getFeatureRequirements(key: FeatureKey): FeatureRequirements {
  return FEATURE_GATES[key];
}
