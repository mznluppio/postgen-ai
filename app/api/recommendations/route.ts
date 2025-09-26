import { NextRequest, NextResponse } from "next/server";

interface RecommendationsPayload {
  analyticsSummary: string;
  planName: string;
}

export async function POST(request: NextRequest) {
  try {
    const { analyticsSummary, planName }: RecommendationsPayload =
      await request.json();

    if (!analyticsSummary) {
      return NextResponse.json(
        { error: "Les métriques d'engagement sont requises." },
        { status: 400 },
      );
    }

    const origin = request.nextUrl.origin;
    const response = await fetch(`${origin}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: `Recommande des optimisations marketing pour ${planName} en te basant sur ces métriques: ${analyticsSummary}. Donne des actions concrètes, rapides à mettre en place et adaptées au plan.`,
        tone: "professional",
        logo: null,
        primaryColor: "#2563EB",
        secondaryColor: "#9333EA",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch AI recommendations");
    }

    const data = await response.json();
    const rawText: string = data?.linkedinPost ?? "";
    const suggestions = rawText
      .split(/\n+/)
      .map((item: string) => item.trim().replace(/^[-•]/, "").trim())
      .filter((item: string) => item.length > 0)
      .slice(0, 6);

    return NextResponse.json({
      suggestions,
      raw: data,
    });
  } catch (error) {
    console.error("Error generating recommendations", error);
    return NextResponse.json(
      {
        error:
          "Impossible de générer des recommandations pour le moment. Veuillez réessayer plus tard.",
      },
      { status: 500 },
    );
  }
}
