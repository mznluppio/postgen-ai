export const AUTOMATION_CHANNELS = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
  { id: "email", label: "Email" },
] as const;

export type AutomationChannel =
  (typeof AUTOMATION_CHANNELS)[number]["id"];

export type AutomationStatus =
  | "manual"
  | "pending"
  | "scheduled"
  | "ready"
  | "processing"
  | "posted"
  | "failed";

export const CHANNEL_LABELS: Record<string, string> =
  AUTOMATION_CHANNELS.reduce(
    (acc, channel) => {
      acc[channel.id] = channel.label;
      return acc;
    },
    {} as Record<string, string>,
  );

export function formatScheduleDisplay(value?: string | null): string {
  if (!value) {
    return "Non planifié";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Planification inconnue";
  }

  return date.toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getAutomationStatusLabel(
  status?: string | null,
): string {
  switch (status) {
    case "pending":
      return "Automatisation en attente";
    case "scheduled":
      return "Diffusion programmée";
    case "ready":
      return "Prêt pour diffusion";
    case "processing":
      return "Automatisation en cours";
    case "posted":
      return "Diffusion effectuée";
    case "failed":
      return "Erreur d'automatisation";
    case "manual":
    case undefined:
    case null:
      return "Publication manuelle";
    default:
      return status.toString();
  }
}

export function getAutomationBadgeVariant(
  status?: string | null,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "pending":
      return "secondary";
    case "scheduled":
    case "ready":
    case "processing":
      return "default";
    case "posted":
      return "outline";
    case "failed":
      return "destructive";
    case "manual":
    case undefined:
    case null:
    default:
      return "outline";
  }
}
