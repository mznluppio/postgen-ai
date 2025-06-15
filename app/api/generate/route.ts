import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

interface BrandingData {
  topic: string;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  tone: string;
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

const contentStructures = {
  linkedin: {
    hook: "Commence par une accroche percutante qui interpelle directement le lecteur",
    body: "Développe 3-4 points clés avec des exemples concrets et des données si pertinent",
    engagement:
      "Termine par une question ouverte qui encourage les commentaires",
    format:
      "Utilise des emojis avec parcimonie, des bullet points pour la lisibilité, maximum 300 mots",
  },
  instagram: {
    hook: "Commence par un titre accrocheur avec des emojis pertinents",
    body: "Contenu visuel et impactant, storytelling personnel si approprié",
    cta: "Call-to-action clair et engageant",
    format:
      "Style moderne et authentique, 5-8 hashtags intégrés naturellement, maximum 150 mots",
  },
  carousel: {
    structure: "Plan de 5 slides avec progression logique",
    slide1: "Introduction du sujet avec accroche",
    slides2_4: "Développement des points clés avec visuels",
    slide5: "Conclusion avec call-to-action fort",
    format:
      "Chaque slide doit être autonome mais s'inscrire dans une narration cohérente",
  },
};

export async function POST(request: NextRequest) {
  try {
    const brandingData: BrandingData = await request.json();
    const { topic, tone } = brandingData;

    // Configuration pour Ollama (local AI)
    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";

    const toneInstruction =
      tonePrompts[tone as keyof typeof tonePrompts] || tonePrompts.professional;

    // Prompts optimisés et plus précis
    const linkedinPrompt = `Tu es un expert en content marketing LinkedIn. Crée un post LinkedIn unique et engageant sur "${topic}".

INSTRUCTIONS PRÉCISES :
- ${toneInstruction}
- ${contentStructures.linkedin.hook}
- ${contentStructures.linkedin.body}
- ${contentStructures.linkedin.engagement}
- ${contentStructures.linkedin.format}

STRUCTURE ATTENDUE :
🎯 [Accroche percutante]

[Développement en 3-4 points avec bullet points]
• Point 1 avec exemple concret
• Point 2 avec donnée ou insight
• Point 3 avec bénéfice clair
• Point 4 avec perspective d'avenir

[Question d'engagement]

#${topic.replace(/\s+/g, "")} #Leadership #Innovation

CONTRAINTES :
- Maximum 280 mots
- Ton ${tone}
- Évite les clichés
- Sois original et apporte de la valeur`;

    const instagramPrompt = `Tu es un expert en content marketing Instagram. Crée un post Instagram captivant sur "${topic}".

INSTRUCTIONS PRÉCISES :
- ${toneInstruction}
- ${contentStructures.instagram.hook}
- ${contentStructures.instagram.body}
- ${contentStructures.instagram.cta}
- ${contentStructures.instagram.format}

STRUCTURE ATTENDUE :
✨ [Titre accrocheur avec emojis]

[Contenu principal engageant]
[Storytelling ou exemple concret]

💡 [Conseil pratique ou insight]

[Call-to-action engageant]

CONTRAINTES :
- Maximum 150 mots
- Ton ${tone}
- 5-8 hashtags intégrés naturellement
- Style moderne et authentique`;

    const carouselPrompt = `Tu es un expert en content marketing. Crée un plan détaillé de carrousel Instagram/LinkedIn de 5 slides sur "${topic}".

INSTRUCTIONS PRÉCISES :
- ${toneInstruction}
- ${contentStructures.carousel.structure}
- Chaque slide doit avoir un titre accrocheur et un contenu spécifique
- Progression logique et narrative cohérente

FORMAT EXACT ATTENDU :
SLIDE 1: [Titre accrocheur d'introduction]
Contenu: [2-3 phrases d'introduction qui posent le contexte]

SLIDE 2: [Titre du premier point clé]
Contenu: [Développement avec exemple ou donnée]

SLIDE 3: [Titre du deuxième point clé]
Contenu: [Développement avec insight pratique]

SLIDE 4: [Titre du troisième point clé]
Contenu: [Développement avec bénéfice concret]

SLIDE 5: [Titre de conclusion avec CTA]
Contenu: [Résumé et appel à l'action fort]

CONTRAINTES :
- Ton ${tone}
- Chaque slide autonome mais cohérente avec l'ensemble
- Titres courts et impactants (max 6 mots)
- Contenu de chaque slide : 2-3 phrases maximum`;

    try {
      // Tentative d'appel à Ollama avec gestion d'erreur améliorée
      const ollamaRequests = [
        fetch(`${ollamaUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3.2",
            prompt: linkedinPrompt,
            stream: false,
            options: {
              temperature: 0.7,
              top_p: 0.9,
              max_tokens: 500,
              stop: ["---", "###"],
            },
          }),
        }),
        fetch(`${ollamaUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3.2",
            prompt: instagramPrompt,
            stream: false,
            options: {
              temperature: 0.8,
              top_p: 0.9,
              max_tokens: 300,
              stop: ["---", "###"],
            },
          }),
        }),
        fetch(`${ollamaUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3.2",
            prompt: carouselPrompt,
            stream: false,
            options: {
              temperature: 0.6,
              top_p: 0.8,
              max_tokens: 800,
              stop: ["---", "###"],
            },
          }),
        }),
      ];

      const responses = await Promise.allSettled(ollamaRequests);

      // Vérifier si au moins une requête a réussi
      const successfulResponses = responses.filter(
        (result): result is PromiseFulfilledResult<Response> =>
          result.status === "fulfilled" && result.value.ok,
      );

      if (successfulResponses.length === 3) {
        const [linkedinData, instagramData, carouselData] = await Promise.all(
          successfulResponses.map((result) => result.value.json()),
        );

        const hashtags = generateSmartHashtags(topic, tone);
        const processedCarousel = processCarouselContent(carouselData.response);

        return NextResponse.json({
          linkedinPost: linkedinData.response.trim(),
          instagramPost: instagramData.response.trim(),
          carousel: processedCarousel,
          hashtags,
          source: "ollama",
        });
      }
    } catch (ollamaError) {
      console.log(
        "Ollama not available, using enhanced fallback content generation",
      );
    }

    // Fallback amélioré avec contenu plus varié et personnalisé
    const generatedContent = generateEnhancedFallbackContent(brandingData);
    return NextResponse.json({
      ...generatedContent,
      source: "fallback",
    });
  } catch (error) {
    console.error("Error in generate API:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du contenu" },
      { status: 500 },
    );
  }
}

function processCarouselContent(
  rawContent: string,
): Array<{ title: string; content: string }> {
  const slides = rawContent
    .split(/SLIDE \d+:/i)
    .filter((slide) => slide.trim());

  return slides
    .map((slide, index) => {
      const lines = slide
        .trim()
        .split("\n")
        .filter((line) => line.trim());
      const titleLine = lines.find(
        (line) => line.trim() && !line.startsWith("Contenu:"),
      );
      const contentLines = lines.filter(
        (line) => line.startsWith("Contenu:") || (!titleLine && line.trim()),
      );

      const title =
        titleLine?.replace(/^\[|\]$/g, "").trim() || `Slide ${index + 1}`;
      const content =
        contentLines
          .map((line) => line.replace(/^Contenu:\s*/i, "").trim())
          .join(" ")
          .trim() || `Contenu informatif sur ${title.toLowerCase()}`;

      return { title, content };
    })
    .slice(0, 5); // Limiter à 5 slides
}

function generateEnhancedFallbackContent(brandingData: BrandingData) {
  const { topic, tone } = brandingData;

  const toneStyles = {
    professional: {
      opener: [
        "Analyse stratégique",
        "Expertise confirmée",
        "Vision d'expert",
        "Retour d'expérience",
      ],
      connector: [
        "En effet",
        "Il convient de noter",
        "Notre analyse révèle",
        "Les données montrent",
      ],
      closer: [
        "Quelle est votre approche ?",
        "Partagez votre expertise",
        "Votre avis nous intéresse",
      ],
      emojis: ["📊", "🎯", "💼", "⚡"],
    },
    friendly: {
      opener: [
        "Parlons ensemble de",
        "J'aimerais partager",
        "Une réflexion sur",
        "Découvrons ensemble",
      ],
      connector: [
        "Et vous savez quoi ?",
        "Ce qui est génial",
        "J'ai remarqué que",
        "La bonne nouvelle",
      ],
      closer: [
        "Qu'en pensez-vous ?",
        "Dites-moi en commentaire !",
        "Partagez votre expérience !",
      ],
      emojis: ["😊", "🤝", "💫", "❤️"],
    },
    inspiring: {
      opener: [
        "Transformons notre vision",
        "Révolutionnons",
        "Osons repenser",
        "Construisons l'avenir",
      ],
      connector: [
        "Imaginez les possibilités",
        "C'est le moment d'agir",
        "Ensemble, nous pouvons",
        "L'innovation commence",
      ],
      closer: [
        "Prêt à relever le défi ?",
        "Rejoignez le mouvement !",
        "L'avenir commence maintenant !",
      ],
      emojis: ["🚀", "💡", "🔥", "⭐"],
    },
    casual: {
      opener: [
        "Alors, parlons de",
        "J'ai envie de vous parler de",
        "Petite réflexion sur",
        "On fait le point sur",
      ],
      connector: [
        "Franchement",
        "Pour être honnête",
        "Ce qui m'a marqué",
        "Au final",
      ],
      closer: ["Et vous, ça vous parle ?", "Votre avis ?", "On en discute ?"],
      emojis: ["😎", "👌", "✨", "🎉"],
    },
  };

  const style =
    toneStyles[tone as keyof typeof toneStyles] || toneStyles.professional;
  const randomOpener =
    style.opener[Math.floor(Math.random() * style.opener.length)];
  const randomConnector =
    style.connector[Math.floor(Math.random() * style.connector.length)];
  const randomCloser =
    style.closer[Math.floor(Math.random() * style.closer.length)];
  const randomEmoji =
    style.emojis[Math.floor(Math.random() * style.emojis.length)];

  // LinkedIn Post optimisé
  const linkedinPost = `${randomEmoji} ${randomOpener} ${topic}

${randomConnector}, cette thématique représente un enjeu crucial pour notre secteur.

✨ Points essentiels à retenir :
• Innovation continue et adaptation aux nouvelles tendances
• Impact direct sur la transformation digitale des entreprises
• Nouvelles opportunités de croissance et de différenciation
• Stratégies gagnantes pour anticiper l'avenir

L'expertise dans ${topic} devient un avantage concurrentiel déterminant.

${randomCloser}

#${topic.replace(/\s+/g, "")} #Innovation #Leadership #Transformation`;

  // Instagram Post optimisé
  const instagramPost = `✨ ${topic.toUpperCase()} ✨

${randomEmoji} ${getRandomHook(tone)}
🎯 Stratégies qui fonctionnent vraiment
📈 Résultats mesurables et durables
🚀 Innovation au quotidien

${randomConnector.toLowerCase()}, c'est le moment parfait pour ${getRandomAction(topic)}.

${randomCloser}

${generateSmartHashtags(topic, tone).slice(0, 6).join(" ")}`;

  // Carrousel optimisé
  const carouselSlides = [
    {
      title: `${topic} : L'essentiel`,
      content: `Découvrez pourquoi ${topic} est devenu incontournable et comment cela transforme notre approche du business moderne.`,
    },
    {
      title: `Les enjeux actuels`,
      content: `${randomConnector}, les défis de 2024 redéfinissent complètement notre vision de ${topic} et ses applications.`,
    },
    {
      title: `Solutions concrètes`,
      content: `Explorez les outils et méthodes qui révolutionnent vraiment l'approche de ${topic} dans votre secteur.`,
    },
    {
      title: `Impact business`,
      content: `Comment ${topic} peut transformer votre stratégie, optimiser vos processus et booster vos résultats durablement.`,
    },
    {
      title: `Passez à l'action`,
      content: `${randomCloser} Commencez dès aujourd'hui votre transformation avec ${topic} et prenez une longueur d'avance.`,
    },
  ];

  const hashtags = generateSmartHashtags(topic, tone);

  return {
    linkedinPost,
    instagramPost,
    carousel: carouselSlides,
    hashtags,
  };
}

function getRandomHook(tone: string): string {
  const hooks = {
    professional: [
      "Excellence et performance",
      "Expertise reconnue",
      "Leadership éclairé",
    ],
    friendly: [
      "Bienveillance et partage",
      "Ensemble c'est mieux",
      "Communauté engagée",
    ],
    inspiring: [
      "Audace et vision",
      "Révolution en marche",
      "Futur en construction",
    ],
    casual: [
      "Simplicité et efficacité",
      "Direct et authentique",
      "Sans prise de tête",
    ],
  };
  const options = hooks[tone as keyof typeof hooks] || hooks.professional;
  return options[Math.floor(Math.random() * options.length)];
}

function getRandomAction(topic: string): string {
  const actions = [
    `maîtriser ${topic}`,
    `exceller dans ${topic}`,
    `innover avec ${topic}`,
    `transformer grâce à ${topic}`,
    `optimiser votre approche de ${topic}`,
  ];
  return actions[Math.floor(Math.random() * actions.length)];
}

function generateSmartHashtags(topic: string, tone: string): string[] {
  const topicHashtag = `#${topic.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "")}`;

  const toneHashtags = {
    professional: [
      "#Leadership",
      "#Expertise",
      "#Excellence",
      "#Stratégie",
      "#Performance",
      "#Innovation",
    ],
    friendly: [
      "#Communauté",
      "#Partage",
      "#Bienveillance",
      "#Ensemble",
      "#Collaboration",
      "#Échange",
    ],
    inspiring: [
      "#Innovation",
      "#Transformation",
      "#Vision",
      "#Révolution",
      "#Futur",
      "#Inspiration",
    ],
    casual: [
      "#Simplicité",
      "#Authenticité",
      "#Créativité",
      "#Naturel",
      "#Spontané",
      "#Vrai",
    ],
  };

  const baseHashtags = [
    "#Business",
    "#Croissance",
    "#Digital",
    "#Avenir",
    "#Success",
    "#Tendances",
    "#Développement",
    "#Opportunités",
  ];

  const specificToneHashtags =
    toneHashtags[tone as keyof typeof toneHashtags] ||
    toneHashtags.professional;

  // Mélanger et sélectionner les meilleurs hashtags
  const allHashtags = [...specificToneHashtags, ...baseHashtags];
  const selectedHashtags = allHashtags
    .sort(() => Math.random() - 0.5)
    .slice(0, 10);

  return [topicHashtag, ...selectedHashtags];
}
