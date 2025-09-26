export const PLAN_ORDER = ["starter", "pro", "enterprise"] as const;

export type Plan = (typeof PLAN_ORDER)[number];

export const PLAN_LIMITS: Record<Plan, number | null> = {
  starter: 3,
  pro: 10,
  enterprise: null,
};

export const PLAN_LABELS: Record<Plan, string> = {
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

export function getPlanLimit(plan: Plan): number | null {
  return PLAN_LIMITS[plan];
}

export function isLimitReached(plan: Plan, memberCount: number) {
  const limit = PLAN_LIMITS[plan];
  if (limit === null) {
    return false;
  }
  return memberCount >= limit;
}

export function getNextPlan(currentPlan: Plan): Plan | null {
  const index = PLAN_ORDER.indexOf(currentPlan);
  if (index === -1 || index === PLAN_ORDER.length - 1) {
    return null;
  }
  return PLAN_ORDER[index + 1];
}
