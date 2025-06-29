import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/auth";
import { checkLimit, incrementUsage, Plan } from "@/lib/saas";
export const dynamic = "force-dynamic";

interface BrandingData {
  topic: string;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  tone: string;
}

interface CarouselSlide {
  title: string;
  content: string;
  imagePrompt: string;
  visualElements: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    layout: "text-focus" | "image-focus" | "balanced" | "quote" | "cta";
  };
}

const tonePrompts = {
  professional:
    "Adopte un ton professionnel et expert. Utilise un vocabulaire précis et technique. Structure le contenu de manière claire et logique. Évite les expressions familières.",
  friendly:
    "Adopte un ton amical et accessible. Utilise un langage chaleureux et inclusif. Crée une connexion personnelle avec le lecteur. Privilégie la simplicité sans sacrifier la qualité.",
  inspiring:
    "Adopte un ton inspirant et motivant. Utilise des mots puissants et des appels à l'action. Crée une vision positive de l'avenir. Encourage le passage à l'action.",
  casual:
    "Adopte un ton décontracté et naturel. Utilise un langage simple et direct. Évite le jargon technique. Privilégie l'authenticité et la spontanéité.",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const brandingData: BrandingData = body;
    const { topic, tone, primaryColor, secondaryColor } = brandingData;
    const organizationId = body.organizationId as string | undefined;

    if (organizationId) {
      const org = await authService.getOrganization(organizationId);
      const allowed = await checkLimit(organizationId, org.plan as Plan);
      if (!allowed) {
        return NextResponse.json({ error: "limit reached" }, { status: 402 });
      }
    }

    const toneInstruction =
      tonePrompts[tone as keyof typeof tonePrompts] || tonePrompts.professional;

    const copilotAPI = process.env.COPILOT_API || "http://localhost:8000";

    console.log(copilotAPI);

    const unifiedPrompt = `Tu es un expert en marketing de contenu, copywriting et storytelling visuel. Gère l'ensemble du contenu pour une marque sur le sujet : "${topic}".

STYLE GLOBAL :
Ton : ${tone}
${toneInstruction}
Couleurs de marque : ${primaryColor}, ${secondaryColor}

1. 🎯 Post LinkedIn
Crée un post LinkedIn impactant selon les consignes suivantes :
- Max 300 mots
- Structure libre avec storytelling et insights personnels
- Hashtags en bas (5 à 7)

2. 📸 Post Instagram
Crée un post Instagram ultra percutant :
- Max 80 mots
- Format : titre avec emoji, phrase d'accroche, insight court, question simple
- 4 à 6 hashtags pertinents

3. 📊 Carrousel (5 slides)
Crée un carrousel de 5 slides en respectant ce format précis :

**SLIDE 1: [Titre accrocheur]**
* **Content :** [Texte inspirant ou informatif]
* **Image :** [Description visuelle réaliste et esthétique]
* **Layout :** [text-focus | balanced | image-focus | cta]

(... Répète jusqu'à SLIDE 5)

4. #️⃣ Hashtags
Génère 10 hashtags pertinents en français, commençant par #, reflétant le contenu et le ton.

NE FOURNIS QUE DU TEXTE : pas d'introduction ni de conclusion, structure uniquement les blocs demandés dans l’ordre.`;

    // Appel API principal (UN seul appel)
    const response = await fetch(`${copilotAPI}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: unifiedPrompt }),
    });

    if (!response.ok) {
      throw new Error("Copilot API error");
    }

    const { answer } = await response.json();

    // Extraction améliorée
    const { linkedinPost, instagramPost, carouselRaw, hashtagsRaw } =
      splitUnifiedResponse(answer);

    const processedCarousel = processAdvancedCarouselContent(
      carouselRaw,
      brandingData,
    );

    // Extraction hashtags fusionnés et dédupliqués
    const hashtagsFromLinkedin = extractHashtagsFromText(linkedinPost);
    const hashtagsFromInstagram = extractHashtagsFromText(instagramPost);
    const hashtagsFromRaw = extractHashtagsFromText(hashtagsRaw);

    const hashtags = Array.from(
      new Set([
        ...hashtagsFromLinkedin,
        ...hashtagsFromInstagram,
        ...hashtagsFromRaw,
      ]),
    );

    console.log(answer);

    if (organizationId) {
      await incrementUsage(organizationId);
    }

    return NextResponse.json({
      linkedinPost: linkedinPost.trim(),
      instagramPost: instagramPost.trim(),
      carousel: processedCarousel,
      hashtags,
      source: "ollama",
    });
  } catch (error) {
    console.error("Error in generate API:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du contenu" },
      { status: 500 },
    );
  }
}

// --- UTILITAIRES ---

function splitUnifiedResponse(answer: string): {
  linkedinPost: string;
  instagramPost: string;
  carouselRaw: string;
  hashtagsRaw: string;
} {
  const linkedinMatch = answer.match(
    /🎯\s*Post\s*LinkedIn\s*([\s\S]*?)(?=📸\s*Post\s*Instagram|📊|4\.\s*#️⃣|$)/i,
  );
  const instagramMatch = answer.match(
    /📸\s*Post\s*Instagram\s*([\s\S]*?)(?=📊\s*Carrousel|4\.\s*#️⃣|$)/i,
  );
  const carouselMatch = answer.match(
    /📊\s*Carrousel\s*\(5 slides\)\s*([\s\S]*?)(?=4\.\s*#️⃣|$)/i,
  );
  const hashtagsMatch = answer.match(/4\.\s*#️⃣\s*Hashtags\s*([\s\S]*)$/i);

  return {
    linkedinPost: linkedinMatch?.[1]?.trim() ?? "",
    instagramPost: instagramMatch?.[1]?.trim() ?? "",
    carouselRaw: carouselMatch?.[1]?.trim() ?? "",
    hashtagsRaw: hashtagsMatch?.[1]?.trim() ?? "",
  };
}

function processAdvancedCarouselContent(
  rawContent: string,
  branding: BrandingData,
): CarouselSlide[] {
  if (!rawContent) {
    return Array.from({ length: 5 }, (_, i) => ({
      title: `Slide ${i + 1}`,
      content: "Contenu à définir",
      imagePrompt: "Image illustrative",
      visualElements: generateVisualElements(branding, "balanced", i),
    }));
  }

  // Diviser slides plus tolérant
  const slides = rawContent
    .split(/SLIDE\s+\d+\s*:/i)
    .slice(1)
    .map((s) => s.trim())
    .filter(Boolean);

  return slides.map((slide, index) => {
    // Titre = première ligne ou fallback
    const lines = slide.split("\n").map((l) => l.trim());
    const titleLine = lines[0] || `Slide ${index + 1}`;

    const getField = (label: string) => {
      const regex = new RegExp(`${label}\\s*:\\s*(.*)`, "i");
      const match = slide.match(regex);
      return match ? match[1].trim() : "";
    };

    const title =
      titleLine.replace(/^(\*\*|__)?(SLIDE\s+\d+\s*:)?\s*/i, "") ||
      `Slide ${index + 1}`;
    const content = getField("Content");
    const imagePrompt = getField("Image");
    const layout = getField(
      "Layout",
    ) as CarouselSlide["visualElements"]["layout"];

    const visualElements = generateVisualElements(
      branding,
      layout || "balanced",
      index,
    );

    return {
      title,
      content,
      imagePrompt,
      visualElements,
    };
  });
}

function generateVisualElements(
  branding: BrandingData,
  layout: CarouselSlide["visualElements"]["layout"],
  slideIndex: number,
): CarouselSlide["visualElements"] {
  const primaryRgb = hexToRgb(branding.primaryColor);
  const secondaryRgb = hexToRgb(branding.secondaryColor);

  const backgroundColor =
    slideIndex % 2 === 0
      ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)`
      : `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.1)`;

  const textColor =
    slideIndex % 2 === 0 ? branding.primaryColor : branding.secondaryColor;
  const accentColor =
    slideIndex % 2 === 0 ? branding.secondaryColor : branding.primaryColor;

  return {
    backgroundColor,
    textColor,
    accentColor,
    layout,
  };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function extractHashtagsFromText(text: string): string[] {
  // Regex Unicode étendu pour gérer les accents, tirets, underscores dans hashtags
  const tags = text.match(/#[\p{L}\p{N}_-]+/gu) ?? [];
  return tags.map((t) => t.trim());
}
