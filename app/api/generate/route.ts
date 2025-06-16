import { NextRequest, NextResponse } from "next/server";
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
    layout: 'text-focus' | 'image-focus' | 'balanced' | 'quote' | 'cta';
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

const visualStyles = {
  professional: {
    layouts: ['text-focus', 'balanced'],
    colors: ['#1a365d', '#2d3748', '#4a5568'],
    patterns: ['geometric', 'minimal', 'corporate']
  },
  friendly: {
    layouts: ['balanced', 'image-focus'],
    colors: ['#ed8936', '#38b2ac', '#9f7aea'],
    patterns: ['organic', 'playful', 'warm']
  },
  inspiring: {
    layouts: ['image-focus', 'quote'],
    colors: ['#e53e3e', '#3182ce', '#805ad5'],
    patterns: ['dynamic', 'energetic', 'bold']
  },
  casual: {
    layouts: ['balanced', 'image-focus'],
    colors: ['#48bb78', '#ed8936', '#4299e1'],
    patterns: ['relaxed', 'natural', 'approachable']
  }
};

export async function POST(request: NextRequest) {
  try {
    const brandingData: BrandingData = await request.json();
    const { topic, tone, primaryColor, secondaryColor } = brandingData;

    // Configuration pour Ollama (local AI)
    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";

    const toneInstruction =
      tonePrompts[tone as keyof typeof tonePrompts] || tonePrompts.professional;

    // Prompt optimisé pour le carousel avec génération d'images
    const carouselPrompt = `Tu es un expert en content marketing et design visuel. Crée un plan détaillé de carrousel Instagram/LinkedIn de 5 slides sur "${topic}".

INSTRUCTIONS PRÉCISES :
- ${toneInstruction}
- Chaque slide doit avoir un titre accrocheur, un contenu engageant, et une description d'image
- Progression narrative cohérente du problème à la solution
- Couleurs principales : ${primaryColor} et ${secondaryColor}
- Ton : ${tone}

FORMAT EXACT ATTENDU (respecte exactement cette structure) :
SLIDE 1: [Titre accrocheur d'introduction]
CONTENT: [2-3 phrases d'introduction qui posent le contexte et captent l'attention]
IMAGE: [Description détaillée de l'image/illustration à générer : style, éléments visuels, couleurs, composition]
LAYOUT: text-focus

SLIDE 2: [Titre du premier point clé]
CONTENT: [Développement avec exemple concret ou statistique percutante]
IMAGE: [Description de l'image : infographie, illustration, photo conceptuelle]
LAYOUT: balanced

SLIDE 3: [Titre du deuxième point clé]
CONTENT: [Insight pratique avec bénéfice concret pour l'audience]
IMAGE: [Description de l'image : schéma, illustration, métaphore visuelle]
LAYOUT: image-focus

SLIDE 4: [Titre du troisième point clé]
CONTENT: [Solution ou conseil actionnable avec impact mesurable]
IMAGE: [Description de l'image : avant/après, processus, résultat]
LAYOUT: balanced

SLIDE 5: [Titre de conclusion avec CTA fort]
CONTENT: [Résumé percutant et appel à l'action clair et motivant]
IMAGE: [Description de l'image : call-to-action visuel, logo, contact]
LAYOUT: cta

CONTRAINTES :
- Ton ${tone}
- Chaque titre : maximum 6 mots, impactant
- Chaque contenu : 2-3 phrases maximum, dense en valeur
- Chaque description d'image : précise, adaptée au ton et au sujet
- Progression logique : problème → analyse → solutions → action
- Cohérence visuelle entre toutes les slides`;

    // Prompts pour LinkedIn et Instagram (inchangés)
    const linkedinPrompt = `Tu es un expert en content marketing LinkedIn. Crée un post LinkedIn unique et engageant sur "${topic}".

INSTRUCTIONS PRÉCISES :
- ${toneInstruction}
- Commence par une accroche percutante qui interpelle directement le lecteur
- Développe 3-4 points clés avec des exemples concrets et des données si pertinent
- Termine par une question ouverte qui encourage les commentaires
- Utilise des emojis avec parcimonie, des bullet points pour la lisibilité, maximum 300 mots

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
- Commence par un titre accrocheur avec emojis pertinents
- Contenu visuel et impactant, storytelling personnel si approprié
- Call-to-action clair et engageant
- Style moderne et authentique, 5-8 hashtags intégrés naturellement, maximum 150 mots

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
              max_tokens: 1200,
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
        const processedCarousel = processAdvancedCarouselContent(
          carouselData.response,
          brandingData
        );

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

function processAdvancedCarouselContent(
  rawContent: string,
  branding: BrandingData
): CarouselSlide[] {
  const slides = rawContent
    .split(/SLIDE \d+:/i)
    .filter((slide) => slide.trim());

  const processedSlides = slides
    .map((slide, index) => {
      const lines = slide
        .trim()
        .split("\n")
        .filter((line) => line.trim());

      // Extraire le titre
      const titleLine = lines.find(
        (line) => line.trim() && !line.startsWith("CONTENT:") && !line.startsWith("IMAGE:") && !line.startsWith("LAYOUT:")
      );
      const title = titleLine?.replace(/^\[|\]$/g, "").trim() || `Slide ${index + 1}`;

      // Extraire le contenu
      const contentLines = lines.filter(line => line.startsWith("CONTENT:"));
      const content = contentLines
        .map(line => line.replace(/^CONTENT:\s*/i, "").trim())
        .join(" ")
        .trim() || `Contenu informatif sur ${title.toLowerCase()}`;

      // Extraire la description d'image
      const imageLines = lines.filter(line => line.startsWith("IMAGE:"));
      const imagePrompt = imageLines
        .map(line => line.replace(/^IMAGE:\s*/i, "").trim())
        .join(" ")
        .trim() || generateDefaultImagePrompt(title, branding);

      // Extraire le layout
      const layoutLines = lines.filter(line => line.startsWith("LAYOUT:"));
      const layout = layoutLines
        .map(line => line.replace(/^LAYOUT:\s*/i, "").trim())
        .join("")
        .trim() as CarouselSlide['visualElements']['layout'] || 'balanced';

      // Générer les éléments visuels
      const visualElements = generateVisualElements(branding, layout, index);

      return {
        title,
        content,
        imagePrompt,
        visualElements
      };
    })
    .slice(0, 5); // Limiter à 5 slides

  // S'assurer qu'on a exactement 5 slides
  while (processedSlides.length < 5) {
    const slideIndex = processedSlides.length;
    processedSlides.push(generateDefaultSlide(slideIndex, branding));
  }

  return processedSlides;
}

function generateDefaultImagePrompt(title: string, branding: BrandingData): string {
  const style = visualStyles[branding.tone as keyof typeof visualStyles] || visualStyles.professional;
  const pattern = style.patterns[Math.floor(Math.random() * style.patterns.length)];
  
  return `Illustration ${pattern} représentant "${title}" dans un style moderne et professionnel, couleurs ${branding.primaryColor} et ${branding.secondaryColor}, composition équilibrée, haute qualité`;
}

function generateVisualElements(
  branding: BrandingData,
  layout: CarouselSlide['visualElements']['layout'],
  slideIndex: number
): CarouselSlide['visualElements'] {
  const style = visualStyles[branding.tone as keyof typeof visualStyles] || visualStyles.professional;
  
  // Créer des variations de couleurs basées sur les couleurs principales
  const primaryRgb = hexToRgb(branding.primaryColor);
  const secondaryRgb = hexToRgb(branding.secondaryColor);
  
  const backgroundColor = slideIndex % 2 === 0 
    ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)`
    : `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.1)`;
    
  const textColor = slideIndex % 2 === 0 
    ? branding.primaryColor
    : branding.secondaryColor;
    
  const accentColor = slideIndex % 2 === 0 
    ? branding.secondaryColor
    : branding.primaryColor;

  return {
    backgroundColor,
    textColor,
    accentColor,
    layout
  };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function generateDefaultSlide(index: number, branding: BrandingData): CarouselSlide {
  const titles = [
    `${branding.topic} : L'essentiel`,
    `Les enjeux actuels`,
    `Solutions concrètes`,
    `Impact business`,
    `Passez à l'action`
  ];
  
  const contents = [
    `Découvrez pourquoi ${branding.topic} est devenu incontournable et comment cela transforme notre approche du business moderne.`,
    `Les défis de 2024 redéfinissent complètement notre vision de ${branding.topic} et ses applications pratiques.`,
    `Explorez les outils et méthodes qui révolutionnent vraiment l'approche de ${branding.topic} dans votre secteur.`,
    `Comment ${branding.topic} peut transformer votre stratégie, optimiser vos processus et booster vos résultats durablement.`,
    `Commencez dès aujourd'hui votre transformation avec ${branding.topic} et prenez une longueur d'avance sur la concurrence.`
  ];

  return {
    title: titles[index] || `Slide ${index + 1}`,
    content: contents[index] || `Contenu informatif sur ${branding.topic}`,
    imagePrompt: generateDefaultImagePrompt(titles[index] || `Slide ${index + 1}`, branding),
    visualElements: generateVisualElements(branding, 'balanced', index)
  };
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

  // Carrousel optimisé avec éléments visuels
  const carouselSlides: CarouselSlide[] = [
    {
      title: `${topic} : L'essentiel`,
      content: `Découvrez pourquoi ${topic} est devenu incontournable et comment cela transforme notre approche du business moderne.`,
      imagePrompt: `Illustration moderne représentant ${topic}, style professionnel, couleurs ${brandingData.primaryColor} et ${brandingData.secondaryColor}`,
      visualElements: generateVisualElements(brandingData, 'text-focus', 0)
    },
    {
      title: `Les enjeux actuels`,
      content: `${randomConnector}, les défis de 2024 redéfinissent complètement notre vision de ${topic} et ses applications.`,
      imagePrompt: `Infographie moderne montrant les défis et enjeux de ${topic}, style analytique, graphiques et données`,
      visualElements: generateVisualElements(brandingData, 'balanced', 1)
    },
    {
      title: `Solutions concrètes`,
      content: `Explorez les outils et méthodes qui révolutionnent vraiment l'approche de ${topic} dans votre secteur.`,
      imagePrompt: `Illustration de solutions et outils pour ${topic}, style innovant, éléments technologiques`,
      visualElements: generateVisualElements(brandingData, 'image-focus', 2)
    },
    {
      title: `Impact business`,
      content: `Comment ${topic} peut transformer votre stratégie, optimiser vos processus et booster vos résultats durablement.`,
      imagePrompt: `Graphique de croissance et impact business de ${topic}, style corporate, courbes ascendantes`,
      visualElements: generateVisualElements(brandingData, 'balanced', 3)
    },
    {
      title: `Passez à l'action`,
      content: `${randomCloser} Commencez dès aujourd'hui votre transformation avec ${topic} et prenez une longueur d'avance.`,
      imagePrompt: `Call-to-action visuel pour ${topic}, style motivant, éléments d'action et de mouvement`,
      visualElements: generateVisualElements(brandingData, 'cta', 4)
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