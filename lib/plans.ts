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

export type PlanId = "starter" | "pro" | "enterprise";

export interface PlanCTA {
  label: string;
  href: string;
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  external?: boolean;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  description: string;
  price: string;
  perks: string[];
  highlight?: boolean;
  cta?: PlanCTA;
}

export const PRICING_PLANS: PlanDefinition[] = [
  {
    id: "starter",
    name: "Starter",
    price: "Gratuit",
    description: "Idéal pour découvrir Postgen AI et publier vos premiers contenus.",
    perks: [
      "Génération de posts illimitée en mode brouillon",
      "1 organisation et 2 membres inclus",
      "Bibliothèque de prompts et briefs prêts à l'emploi",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "29€ / mois",
    description: "Pensé pour les équipes marketing qui publient chaque semaine.",
    perks: [
      "Collaborateurs illimités",
      "Automatisations multi-canales et planification",
      "Analyses d'engagement et recommandations IA",
    ],
    highlight: true,
    cta: {
      label: "Choisir le plan Pro",
      href: "/auth",
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Sur mesure",
    description: "Accompagnement premium pour les marques à forte volumétrie.",
    perks: [
      "Support dédié et SLA contractuel",
      "Espaces sur-mesure et intégrations avancées",
      "Hébergement souverain et conformité renforcée",
    ],
    cta: {
      label: "Planifier une démo",
      href: "mailto:hello@postgen.ai",
      variant: "outline",
      external: true,
    },
  },
];

export const PRICING_PLANS_BY_ID: Record<PlanId, PlanDefinition> = PRICING_PLANS.reduce(
  (acc, plan) => {
    acc[plan.id] = plan;
    return acc;
  },
  {} as Record<PlanId, PlanDefinition>,
);
