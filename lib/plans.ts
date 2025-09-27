export const PLAN_ORDER = ["starter", "pro", "enterprise"] as const;

export type Plan = (typeof PLAN_ORDER)[number];

export const PLAN_LABELS: Record<Plan, string> = {
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

export type SeatBillingInterval = "monthly" | "yearly";

export interface PlanSeatAddOn {
  currency: string;
  interval: SeatBillingInterval;
  pricePerSeat?: number;
  description?: string;
}

export interface PlanSeatPolicy {
  includedSeats: number | null;
  addOn?: PlanSeatAddOn;
}

export const PLAN_SEAT_POLICIES: Record<Plan, PlanSeatPolicy> = {
  starter: {
    includedSeats: 2,
  },
  pro: {
    includedSeats: 10,
    addOn: {
      pricePerSeat: 5,
      currency: "EUR",
      interval: "monthly",
      description: "Siège additionnel facturé au mois",
    },
  },
  enterprise: {
    includedSeats: 25,
    addOn: {
      currency: "EUR",
      interval: "monthly",
      description: "Volume et tarification personnalisés",
    },
  },
};

export function getPlanSeatPolicy(plan: Plan): PlanSeatPolicy {
  return PLAN_SEAT_POLICIES[plan];
}

export function getPlanSeatLimit(
  plan: Plan,
  additionalSeatsPurchased: number = 0,
): number | null {
  const policy = getPlanSeatPolicy(plan);

  if (policy.includedSeats === null) {
    return null;
  }

  const additionalSeats = policy.addOn
    ? Math.max(0, additionalSeatsPurchased)
    : 0;

  return policy.includedSeats + additionalSeats;
}

export function isLimitReached(
  plan: Plan,
  memberCount: number,
  additionalSeatsPurchased: number = 0,
) {
  const limit = getPlanSeatLimit(plan, additionalSeatsPurchased);
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

export function isPlanAtLeast(current: Plan, minimum: Plan) {
  return PLAN_ORDER.indexOf(current) >= PLAN_ORDER.indexOf(minimum);
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
  seatSummary?: {
    included: string;
    additional?: string;
  };
}

export const PRICING_PLANS: PlanDefinition[] = [
  {
    id: "starter",
    name: "Starter",
    price: "0€ / espace / mois",
    description: "Idéal pour découvrir Postgen AI et publier vos premiers contenus.",
    perks: [
      "Génération de posts illimitée en mode brouillon",
      "1 espace organisationnel avec 2 sièges inclus",
      "Bibliothèque de prompts et briefs prêts à l'emploi",
    ],
    seatSummary: {
      included: "2 sièges inclus par espace",
      additional: "Besoin de plus ? Passez au plan Pro pour ajouter des membres.",
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: "29€ / espace / mois",
    description: "Pensé pour les équipes marketing qui publient chaque semaine.",
    perks: [
      "10 sièges inclus par espace",
      "Ajoutez des sièges supplémentaires pour 5€ / membre / mois",
      "Automatisations multi-canales et planification",
      "Analyses d'engagement et recommandations IA",
    ],
    highlight: true,
    cta: {
      label: "Choisir le plan Pro",
      href: "/auth",
    },
    seatSummary: {
      included: "10 sièges inclus par espace",
      additional: "Siège supplémentaire : 5€ / membre / mois",
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Sur mesure",
    description: "Accompagnement premium pour les marques à forte volumétrie.",
    perks: [
      "25 sièges inclus avec extension sur devis",
      "Support dédié, SLA contractuel et pilotage avancé",
      "Espaces sur-mesure et hébergement souverain",
    ],
    cta: {
      label: "Planifier une démo",
      href: "mailto:hello@postgen.ai",
      variant: "outline",
      external: true,
    },
    seatSummary: {
      included: "25 sièges inclus par espace",
      additional: "Ajouts de sièges et SLA étendus sur devis",
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
