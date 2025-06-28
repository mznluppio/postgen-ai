"use client";

import { useState } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

interface ContentGeneratorProps {
  type: string;
  title: string;
  description?: string;
  placeholder?: string;
  llmApiUrl?: string;
  onGenerated?: (content: string) => void;
}

export default function ContentGenerator({
  type,
  title,
  description,
  placeholder = "Entrez un sujet...",
  llmApiUrl = process.env.NEXT_PUBLIC_LLM_API || "http://localhost:8000",
  onGenerated,
}: ContentGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Veuillez entrer un sujet");
      return;
    }

    setLoading(true);
    setError("");
    setContent("");

    try {
      const prompt = generatePrompt(type, topic, description);

      const response = await fetch(`${llmApiUrl}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur API (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      if (!data.answer) {
        throw new Error("Réponse vide de l'API");
      }

      setContent(data.answer);
      onGenerated?.(data.answer);
    } catch (err: any) {
      console.error("Erreur lors de la génération:", err);
      setError(err.message || "Erreur inconnue lors de la génération");
    } finally {
      setLoading(false);
    }
  };

  const generatePrompt = (
    type: string,
    topic: string,
    description?: string,
  ) => {
    const typeLower = type.toLowerCase();

    // Types de contenu visuel
    const visualTypes = [
      "carousel",
      "carousels",
      "carrousel",
      "carrousels",
      "infographic",
      "infographie",
      "story",
      "stories",
      "thumbnail",
      "thumbnails",
    ];
    const isVisual = visualTypes.includes(typeLower);

    // Types de contenu social
    const socialTypes = ["linkedin", "twitter", "instagram", "facebook"];
    const isSocial = socialTypes.includes(typeLower);

    // Types d'email
    const emailTypes = ["email", "newsletter"];
    const isEmail = emailTypes.includes(typeLower);

    // Types d'articles
    const articleTypes = ["article", "blog", "publication"];
    const isArticle = articleTypes.includes(typeLower);

    if (isVisual) {
      return generateVisualPrompt(typeLower, topic, description);
    }

    // Prompt de base pour contenu non-visuel
    let prompt = `Tu es un expert en marketing digital et rédaction. Génère un contenu de type "${type}" sur le sujet suivant : "${topic}".

Contexte :
${description || "Pas de contexte spécifique fourni."}

`;

    // Instructions spécifiques selon le type
    if (isSocial) {
      prompt += `Instructions pour contenu social :
- Crée un post engageant avec une structure claire : accroche, développement, call-to-action
- Utilise un ton dynamique et professionnel adapté à ${type}
- Ajoute des emojis pertinents et des hashtags stratégiques
- Optimise pour ${type === "linkedin" ? "un public professionnel" : "l'engagement et la viralité"}
- Longueur optimale pour la plateforme
- Pas de balises Markdown, texte brut uniquement

`;
    } else if (isEmail) {
      prompt += `Instructions pour email/newsletter :
- Structure professionnelle : objet accrocheur, introduction personnalisée, corps structuré, conclusion avec CTA
- Ton personnalisé et convaincant
- Optimisé pour la conversion et l'engagement
- Inclus des suggestions d'objet email

`;
    } else if (isArticle) {
      prompt += `Instructions pour article de blog :
- Article structuré en Markdown professionnel
- Pas de section "Introduction" au début ni "Conclusion" à la fin
- Utilise des titres et sous-titres pertinents (##, ###)
- Contenu informatif, crédible et engageant
- Intègre des suggestions d'images (descriptions uniquement)
- Ton naturel et expert
- Format Markdown uniquement

`;
    } else {
      prompt += `Instructions génériques :
- Contenu de qualité professionnelle
- Structure claire et engageante
- Adapté au format "${type}"

`;
    }

    prompt += `Langue : français.
Format : ${isArticle ? "Markdown" : "texte brut uniquement"}.`;

    return prompt;
  };

  const generateVisualPrompt = (
    typeLower: string,
    topic: string,
    description?: string,
  ) => {
    const baseContext = description || "Contenu marketing professionnel";

    // Prompt de base amélioré pour tous les types visuels
    const basePrompt = `Tu es un développeur web expert et designer UI/UX spécialisé dans la création de contenus visuels pour les réseaux sociaux. Tu maîtrises parfaitement les tendances design 2024-2025.

RÈGLE ABSOLUE : Tu dois répondre EXCLUSIVEMENT avec du code HTML complet et fonctionnel. Aucun texte explicatif, aucun commentaire en dehors du code HTML.

Sujet : "${topic}"
Contexte : ${baseContext}

STRUCTURE TECHNIQUE OBLIGATOIRE :
- Document HTML5 complet avec <!DOCTYPE html>
- Balises <html lang="fr">, <head> complètes avec meta viewport
- CSS moderne intégré dans <style> avec variables CSS
- Design system cohérent (couleurs, typographie, espacements)
- Responsive design mobile-first obligatoire
- Performance optimisée (pas d'images externes lourdes)

DESIGN TRENDS 2024-2025 À INTÉGRER :
- Glassmorphism et neumorphism subtils
- Gradients vibrants et couleurs saturées
- Typographie expressive (font-weight: 700-900)
- Micro-animations et transitions fluides (ease-out, cubic-bezier)
- Ombres portées dynamiques et multi-layers
- Espacement généreux et hiérarchie visuelle claire
- Palette de couleurs moderne et contrastée
- Effets de parallaxe et depth layers

TYPOGRAPHIE MODERNE :
- Google Fonts: Inter, Poppins, ou Outfit
- Hiérarchie claire: 48px+ pour titres, 16-18px pour texte
- Font-weight: 300 (light), 500 (medium), 700-900 (bold/black)
- Line-height optimisé: 1.2 pour titres, 1.6 pour texte

COULEURS TENDANCE 2024-2025 :
- Primaires: #6366F1 (indigo), #8B5CF6 (violet), #06B6D4 (cyan)
- Secondaires: #F59E0B (amber), #EF4444 (red), #10B981 (emerald)
- Neutrals: #0F172A (slate-900), #1E293B (slate-800), #F8FAFC (slate-50)
- Gradients: linear-gradient(135deg, #667eea 0%, #764ba2 100%)

ANIMATIONS CSS MODERNES :
- Transform: translateY, scale, rotate avec GPU acceleration
- Transitions: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- Keyframes pour animations complexes
- Hover effects subtils mais impactants
- Loading states et micro-interactions

`;

    switch (typeLower) {
      case "carousel":
      case "carousels":
      case "carrousel":
      case "carrousels":
        return (
          basePrompt +
          `TYPE : CAROUSEL STATIQUE - SLIDES EXPORTABLES

SPÉCIFICATIONS TECHNIQUES CRUCIALES :

1. STRUCTURE VERTICALE POUR EXPORT :
   - Format: Slides empilées verticalement (pas de carousel interactif)
   - Dimensions: Chaque slide 1080x1080px (format carré Instagram)
   - Séparation: 40px entre chaque slide pour distinction claire
   - Container: width: 1080px, centré avec margin auto
   - Total: 8-10 slides disposées en colonne verticale

2. SLIDES INDIVIDUELLES EXPORTABLES :
   - Chaque slide = div indépendant avec ID unique (slide-1, slide-2, etc.)
   - Dimensions fixes: width: 1080px, height: 1080px
   - Background: couleur unie ou gradient différent par slide
   - Bordure: border-radius: 24px pour effet moderne
   - Shadow: box-shadow pour depth et séparation visuelle

3. DESIGN SYSTEM COHÉRENT :
   - Palette: 3-4 couleurs max, appliquées différemment par slide
   - Typographie: même police, tailles cohérentes
   - Layout: template consistant mais contenu varié
   - Branding: logo/nom placé au même endroit sur chaque slide
   - Progression: contenu qui suit une logique narrative

4. CONTENU STRUCTURE (8-10 SLIDES) :
   - Slide 1: Titre principal + hook accrocheur + branding
   - Slide 2: Problème/question/contexte
   - Slides 3-6: Points clés (1 point = 1 slide) avec icônes
   - Slide 7: Statistiques/données importantes
   - Slide 8: Conseil/tip actionnable
   - Slide 9: Récapitulatif/résumé
   - Slide 10: Call-to-action + contact/branding

5. TEMPLATE DESIGN PAR SLIDE :
   - Header: titre de la slide (32-40px, font-weight: 800)
   - Body: contenu principal (20-24px, font-weight: 500)
   - Visual: icône ou emoji (64px) centré ou en coin
   - Footer: numéro de slide (1/10) et branding discret
   - Layout: flex column, justify-content: space-between

6. COULEURS ROTATIVES PAR SLIDE :
   - Slide 1: Gradient principal (hook)
   - Slide 2: Couleur secondaire (problème)
   - Slides 3-6: Alternance de couleurs (points clés)
   - Slide 7: Couleur accent (données)
   - Slide 8: Couleur success (conseil)
   - Slide 9: Couleur neutre (résumé)
   - Slide 10: Couleur CTA (action)

7. EXPORT-READY FEATURES :
   - Chaque slide peut être screenshot individuellement
   - Pas d'interactions JavaScript (statique uniquement)
   - Print-friendly avec @media print si nécessaire
   - Identifiants uniques pour ciblage individuel
   - Espacement suffisant pour découpe propre

8. RESPONSIVE PREVIEW :
   - Version desktop: slides 1080x1080px
   - Version mobile: slides responsive mais ratio conservé
   - Zoom: contenu lisible même en petit format
   - Contraste: couleurs optimisées pour tous écrans

9. BONUS FEATURES :
   - Numérotation automatique des slides (1/10, 2/10...)
   - Couleurs contrastées pour accessibilité
   - Typographie lisible sans zoom
   - Icônes SVG ou emojis haute résolution
   - Branding consistant sur toutes les slides

RÉSULTAT ATTENDU :
Une série de 8-10 slides Instagram statiques, empilées verticalement, prêtes à être exportées individuellement en images pour publication sur les réseaux sociaux. Chaque slide doit être visuellement cohérente mais distincte, avec un contenu progressif et engageant.

IMPORTANT : PAS de carousel interactif, PAS de JavaScript de navigation, SEULEMENT des slides statiques exportables.`
        );

      case "infographic":
      case "infographie":
        return (
          basePrompt +
          `TYPE : INFOGRAPHIE RÉSEAUX SOCIAUX PREMIUM

SPÉCIFICATIONS DESIGN AVANCÉES :

1. FORMAT ET DIMENSIONS OPTIMISÉES :
   - Aspect ratio: 2:3 (Pinterest) ou 4:5 (Instagram)
   - Largeur max: 1080px (Instagram optimized)
   - Hauteur adaptive avec sections équilibrées
   - Design vertical scroll-friendly

2. LAYOUT PROFESSIONNEL :
   - Header: logo/branding + titre principal + hook
   - 6-8 sections thématiques avec visuels
   - Data visualization: charts, graphs, icons
   - Footer: source, CTA, branded elements
   - Flow de lecture en Z ou F-pattern

3. ÉLÉMENTS VISUELS PREMIUM :
   - Charts: CSS/SVG purs (pas de bibliothèques externes)
   - Progress bars animées avec pourcentages
   - Icon system cohérent (outline ou filled style)
   - Couleurs: 3-4 couleurs max + neutrals
   - Shadows: box-shadow multi-layer pour depth

4. TYPOGRAPHIE HIÉRARCHISÉE :
   - H1: 36-48px, font-weight: 900
   - H2: 24-32px, font-weight: 700
   - Body: 16-18px, font-weight: 400-500
   - Captions: 12-14px, font-weight: 300
   - Contrast ratio: minimum 4.5:1

5. DATA VISUALIZATION :
   - Bar charts: CSS transforms avec animations
   - Donut charts: CSS conic-gradient
   - Line graphs: SVG paths avec stroke-dasharray
   - Statistics: grandes valeurs + contexte
   - Comparaisons: before/after, vs competitors

6. ANIMATIONS INTELLIGENTES :
   - Scroll-triggered reveals (Intersection Observer)
   - Counter animations pour statistiques
   - Progressive chart drawing
   - Hover states sur éléments interactifs
   - Smooth transitions entre sections

7. CONTENU STRUCTURE :
   - Titre accrocheur avec bénéfice clair
   - Intro: problème ou contexte (1-2 lignes)
   - 5-6 points clés avec données supporting
   - Conclusion: takeaway principal
   - CTA: prochaine étape claire

8. MOBILE-FIRST DESIGN :
   - Typography scaling responsif
   - Touch-friendly interactive elements
   - Optimized loading et performance
   - Readable sans zoom sur mobile
   - Consistent spacing sur tous devices

RÉSULTAT ATTENDU : Infographie professionnelle, data-driven, optimisée pour engagement et partage sur réseaux sociaux.`
        );

      case "story":
      case "stories":
        return (
          basePrompt +
          `TYPE : STORY INSTAGRAM/FACEBOOK PREMIUM

SPÉCIFICATIONS STORIES OPTIMISÉES :

1. FORMAT STORIES STRICT :
   - Aspect ratio: 9:16 (1080x1920px optimal)
   - Design: 100vw x 100vh (full viewport)
   - Safe zones: margin 60px top/bottom, 40px sides
   - Vertical layout adaptatif

2. DESIGN ENGAGEMENT-FOCUSED :
   - Background: gradient premium ou couleur vibrant
   - Overlay: glassmorphism ou solid avec opacity
   - Typography: très lisible, contrasté, gros (24px+ mobile)
   - Visual hierarchy: 1 élément principal par story
   - Call-to-action: swipe up simulation ou bouton

3. STORY SEQUENCE (5-7 slides) :
   - Story 1: Hook + titre principal
   - Story 2-5: Points clés avec visuels
   - Story 6: Récapitulatif/tips
   - Story 7: CTA + branding

4. ANIMATIONS STORIES :
   - Auto-progression: 5-7 secondes par slide
   - Progress bar: animée en haut
   - Content reveal: fade-in ou slide-up
   - Touch interaction: tap pour next/prev
   - Pause sur hold (long press simulation)

5. INTERACTIVE ELEMENTS :
   - Progress indicators en haut (15 segments)
   - Tap zones: left/right pour navigation
   - Swipe gestures: up pour more info
   - Visual feedback sur interactions
   - Mock elements: quiz, poll, slider

6. CONTENT STRATEGY :
   - Micro-content: 1 idée par story
   - Visual storytelling progressif
   - Emojis et icons expressifs
   - Text overlay sur backgrounds
   - Branding consistant mais subtil

7. MOBILE OPTIMIZATION :
   - Touch-first design
   - Font-size: minimum 18px pour lisibilité
   - Contrast: couleurs vives mais accessibles
   - Loading: instantané avec CSS pur
   - Performance: pas d'assets externes lourds

8. VIRAL POTENTIAL :
   - Content: tips, behind-scenes, teasers
   - Visual: aesthetic cohérent avec brand
   - Engagement: questions, challenges, polls
   - Hashtags: intégrés naturellement dans design
   - Screenshot-worthy: chaque story = post potential

RÉSULTAT ATTENDU : Séquence de stories Instagram premium, optimisée pour rétention et engagement maximum.`
        );

      case "thumbnail":
      case "thumbnails":
        return (
          basePrompt +
          `TYPE : THUMBNAIL YOUTUBE/RÉSEAUX PREMIUM

SPÉCIFICATIONS THUMBNAIL OPTIMISÉES :

1. FORMAT ET RATIOS :
   - YouTube: 16:9 (1280x720px optimal)
   - Instagram: 4:5 ou 1:1 selon usage
   - LinkedIn: 1.91:1 pour posts
   - Design: scalable de 150px à 1280px

2. DESIGN CLICKBAIT ÉTHIQUE :
   - Titre: maximum 4-6 mots, impactant
   - Contraste: très élevé pour visibilité
   - Couleurs: vives et saturées (YouTube-friendly)
   - Composition: règle des tiers
   - Focus: 1 élément principal central

3. TYPOGRAPHIE THUMBNAIL :
   - Font: ultra-bold (800-900 weight)
   - Size: responsive, énorme sur desktop
   - Stroke: outline blanc/noir pour lisibilité
   - Shadow: drop-shadow pour depth
   - Colors: contrastées avec background

4. ÉLÉMENTS VISUELS :
   - Background: gradient dynamique ou couleur unie
   - Shapes: géométriques modernes (circles, arrows)
   - Icons: SVG simples et reconnaissables
   - Effects: glow, neon, 3D transforms
   - Composition: asymétrique mais équilibrée

5. PSYCHOLOGY-DRIVEN DESIGN :
   - Curiosity gap: créer l'intrigue
   - Urgency: mots comme "NOUVEAU", "URGENT"
   - Benefit: valeur claire et immédiate
   - Emotion: couleurs et visuels émotionels
   - Pattern interrupt: design qui sort du lot

6. PERFORMANCE OPTIMIZATION :
   - Lisibilité: test à 150px width
   - Contrast: ratio minimum 7:1
   - Mobile: optimisé pour small screens
   - Loading: CSS pur, pas d'images
   - Scalability: vectoriel quand possible

7. A/B TEST VARIANTS :
   - Version 1: texte + background
   - Version 2: emoji + minimal text
   - Version 3: question + visual answer
   - Couleurs: tester rouge vs bleu vs vert
   - Layout: centered vs asymétrique

8. PLATFORM OPTIMIZATION :
   - YouTube: rouge/orange pour CTR
   - Instagram: aesthetic cohérent avec feed
   - LinkedIn: professionnel mais accrocheur
   - Twitter: high contrast pour timeline
   - TikTok: vertical version avec texte gros

RÉSULTAT ATTENDU : Thumbnail ultra-efficace, optimisée CTR, testée psychologiquement pour maximum engagement.`
        );

      default:
        return (
          basePrompt +
          `TYPE : CONTENU VISUEL PERSONNALISÉ PREMIUM

SPÉCIFICATIONS GÉNÉRALES AVANCÉES :

1. DESIGN SYSTEM MODERNE :
   - Palette: 3 couleurs max + neutrals
   - Typography: hiérarchie claire et moderne
   - Spacing: système 8px (8, 16, 24, 32, 48, 64px)
   - Shadows: layered pour depth
   - Borders: radius consistant (8px, 16px)

2. RESPONSIVE DESIGN :
   - Mobile-first approach
   - Breakpoints: 320px, 768px, 1024px, 1200px
   - Fluid typography: clamp() pour scaling
   - Touch-friendly: 44px minimum touch targets
   - Performance: CSS Grid + Flexbox optimisé

3. ANIMATIONS MODERNES :
   - Micro-interactions sur hover/focus
   - Loading states et skeleton screens
   - Page transitions fluides
   - Scroll-triggered animations
   - Performance: transform + opacity only

4. ACCESSIBILITÉ PREMIUM :
   - Contrast ratio: minimum 4.5:1
   - Focus indicators visibles
   - ARIA labels complets
   - Keyboard navigation
   - Screen reader friendly

5. CONTENU ENGAGEMENT :
   - Storytelling clair et progressif
   - Call-to-action évidents
   - Bénéfices utilisateur mis en avant
   - Social proof intégré
   - Viral potential optimisé

RÉSULTAT ATTENDU : Contenu visuel "${typeLower}" premium, moderne, et optimisé pour les réseaux sociaux 2024-2025.`
        );
    }
  };

  const renderContent = () => {
    if (!content) return null;

    const typeLower = type.toLowerCase();
    const isMarkdown = ["article", "blog", "publication"].includes(typeLower);
    const isVisual = [
      "carousel",
      "carousels",
      "carrousel",
      "carrousels",
      "infographic",
      "infographie",
      "story",
      "stories",
      "thumbnail",
      "thumbnails",
    ].includes(typeLower);

    const isCarousel = [
      "carousel",
      "carousels",
      "carrousel",
      "carrousels",
    ].includes(typeLower);

    return (
      <div className="mt-8 space-y-6">
        <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
            <h3 className="text-lg font-bold text-gray-800">
              ✨ Contenu généré - {type}
            </h3>
            {isVisual && (
              <p className="text-sm text-gray-600 mt-1">
                {isCarousel
                  ? "🎠 Slides individuelles prêtes à l'export"
                  : "🎨 Contenu HTML interactif optimisé réseaux sociaux"}
              </p>
            )}
          </div>
          <div className="p-6">
            {isVisual ? (
              <div className="space-y-6">
                {/* Aperçu iframe amélioré */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <div className="bg-white px-4 py-2 text-xs text-gray-600 border-b border-gray-200 flex justify-between items-center">
                    <span>
                      {isCarousel
                        ? "🎠 Slides exportables - Faites défiler pour voir toutes les slides"
                        : "📱 Aperçu interactif - Cliquez et interagissez"}
                    </span>
                    {isCarousel && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Export individuel possible
                      </span>
                    )}
                  </div>
                  <iframe
                    srcDoc={content}
                    className="w-full h-[600px] border-0 bg-white"
                    title="Aperçu du contenu généré"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>

                {/* Actions rapides */}
                <div className="flex gap-3 flex-wrap p-4 bg-gray-50 rounded-xl">
                  <button
                    onClick={() => navigator.clipboard.writeText(content)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    📋 Copier le code
                  </button>

                  <button
                    onClick={() => {
                      const blob = new Blob([content], { type: "text/html" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${type}-${topic.replace(/\s+/g, "-")}-${Date.now()}.html`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    💾 Télécharger HTML
                  </button>

                  <button
                    onClick={() => {
                      const newWindow = window.open();
                      newWindow?.document.write(content);
                      newWindow?.document.close();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    🚀 Ouvrir en plein écran
                  </button>

                  {isCarousel && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 text-sm rounded-lg border border-amber-200">
                      <span>💡</span>
                      <span className="text-xs">
                        Ouvrez en plein écran puis screenshot chaque slide
                        individuellement
                      </span>
                    </div>
                  )}
                </div>

                {/* Instructions spéciales pour carousel */}
                {isCarousel && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      🎯 Comment exporter vos slides :
                    </h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Cliquez sur "Ouvrir en plein écran" ci-dessus</li>
                      <li>
                        Faites défiler pour voir toutes les slides empilées
                      </li>
                      <li>
                        Utilisez l'outil de capture d'écran pour capturer chaque
                        slide individuellement
                      </li>
                      <li>
                        Chaque slide fait exactement 1080x1080px (format carré
                        Instagram)
                      </li>
                      <li>
                        Publiez vos slides une par une sur Instagram/LinkedIn
                      </li>
                    </ol>
                  </div>
                )}

                {/* Code source amélioré */}
                <details className="group">
                  <summary className="cursor-pointer text-gray-700 hover:text-gray-900 font-semibold mb-3 flex items-center gap-2 transition-colors">
                    <span className="transform transition-transform group-open:rotate-90">
                      ▶
                    </span>
                    📄 Code source HTML
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {Math.round(content.length / 1024)}KB
                    </span>
                  </summary>
                  <div className="mt-3 border rounded-lg overflow-hidden">
                    <div className="bg-gray-800 text-gray-200 px-4 py-2 text-xs font-mono">
                      {type.toLowerCase()}.html
                    </div>
                    <pre className="p-4 bg-gray-50 text-xs overflow-x-auto max-h-80 border-0">
                      <code className="text-gray-800">{content}</code>
                    </pre>
                  </div>
                </details>
              </div>
            ) : isMarkdown ? (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-normal">
                  {content}
                </pre>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-normal bg-gray-50 p-4 rounded-lg">
                {content}
              </pre>
            )}
          </div>
        </div>

        {/* Actions principales */}
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => navigator.clipboard.writeText(content)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            📋 Copier le contenu
          </button>

          <button
            onClick={() => setContent("")}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            🗑️ Nouveau contenu
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
        {description && (
          <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
            {description}
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGenerate();
        }}
        className="w-full mb-6"
      >
        <div className="relative">
          <PlaceholdersAndVanishInput
            topic={topic}
            loading={loading}
            placeholders={[
              "Marketing digital 2025",
              "Stratégies Instagram engagement",
              "Outils productivité remote",
              "Tendances design UI/UX",
              "IA et automatisation business",
              "Personal branding LinkedIn",
              "E-commerce conversion",
              "Content marketing viral",
            ]}
            onChange={(e) => setTopic(e.target.value)}
          />
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="flex items-center gap-3 text-blue-600">
                <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span className="text-sm font-medium">
                  Génération en cours...
                </span>
              </div>
            </div>
          )}
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <p className="text-sm text-red-800">
              <span className="font-semibold">Erreur :</span> {error}
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <div>
              <p className="text-sm text-blue-800 font-medium">
                🚀 Génération de votre contenu {type}...
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Optimisation pour réseaux sociaux en cours
              </p>
            </div>
          </div>
        </div>
      )}

      {renderContent()}
    </div>
  );
}
