import { contentCreation, NavigationItem } from "./navigation-data";

export type ContentCategorySlug = "social" | "visual" | "articles" | "email";

const CATEGORY_URLS: Record<ContentCategorySlug, string> = {
  social: "/dashboard/content/social",
  visual: "/dashboard/content/visual",
  articles: "/dashboard/content/articles",
  email: "/dashboard/content/email",
};

const CATEGORY_DESCRIPTIONS: Record<ContentCategorySlug, string> = {
  social:
    "Accédez à tous vos générateurs de contenus sociaux : publications, threads et formats courts adaptés à chaque réseau.",
  visual:
    "Créez des visuels impactants (carrousels, stories, miniatures...) en sélectionnant d'abord le format qui convient à votre projet.",
  articles:
    "Générez des contenus longs structurés (articles de blog, études de cas, livres blancs...) avant de choisir le projet cible.",
  email:
    "Choisissez le type de campagne email à préparer avant de sélectionner le projet destinataire et votre segmentation.",
};

export function getContentCategory(
  slug: ContentCategorySlug,
): NavigationItem | undefined {
  const url = CATEGORY_URLS[slug];
  return contentCreation.find((item) => item.url === url);
}

export function getContentCategoryDescription(slug: ContentCategorySlug): string {
  return CATEGORY_DESCRIPTIONS[slug];
}
