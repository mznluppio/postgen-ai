import type { LucideIcon } from "lucide-react";
import { Mail, Send, Workflow, FileText } from "lucide-react";

export interface EmailContentType {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  generatorType: string;
}

export interface EmailSegmentOption {
  id: string;
  label: string;
  description?: string;
}

export const EMAIL_BASE_PATH = "/dashboard/content/email" as const;

export const EMAIL_CONTENT_TYPES: EmailContentType[] = [
  {
    id: "campaigns",
    title: "Campagnes email",
    description:
      "Séquences ponctuelles ou promotionnelles envoyées à une audience ciblée.",
    icon: Send,
    generatorType: "campaigns",
  },
  {
    id: "newsletter",
    title: "Newsletter",
    description:
      "Contenu éditorial récurrent pour entretenir la relation avec votre communauté.",
    icon: Mail,
    generatorType: "newsletter",
  },
  {
    id: "sequences",
    title: "Séquences automatisées",
    description:
      "Workflows d'emails déclenchés automatiquement selon le parcours utilisateur.",
    icon: Workflow,
    generatorType: "sequences",
  },
  {
    id: "templates",
    title: "Modèles réutilisables",
    description:
      "Structures d'emails prêtes à l'emploi pour industrialiser vos campagnes.",
    icon: FileText,
    generatorType: "templates",
  },
] satisfies EmailContentType[];

export function getEmailContentType(id?: string | string[]): EmailContentType | undefined {
  if (!id) return undefined;
  const slug = Array.isArray(id) ? id[0] : id;
  return EMAIL_CONTENT_TYPES.find((type) => type.id === slug);
}

export const EMAIL_SEGMENT_OPTIONS: EmailSegmentOption[] = [
  {
    id: "all",
    label: "Toute la base",
    description: "Envoi à l'ensemble de vos contacts.",
  },
  {
    id: "leads",
    label: "Leads chauds",
    description: "Prospects ayant montré un intérêt récent.",
  },
  {
    id: "customers",
    label: "Clients actifs",
    description: "Clients ayant acheté au cours des 6 derniers mois.",
  },
  {
    id: "dormant",
    label: "Inactifs",
    description: "Contacts à réactiver via une campagne spécifique.",
  },
] satisfies EmailSegmentOption[];

export const EMAIL_SEGMENT_LABELS = EMAIL_SEGMENT_OPTIONS.reduce(
  (acc, segment) => {
    acc[segment.id] = segment.label;
    return acc;
  },
  {} as Record<string, string>,
);

export function buildEmailTypeUrl(id: string): string {
  return `${EMAIL_BASE_PATH}/${id}`;
}
