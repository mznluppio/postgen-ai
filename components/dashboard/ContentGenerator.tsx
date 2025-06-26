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
    if (!topic) return;

    setLoading(true);
    setError("");
    setContent("");

    const typeLower = type.toLowerCase();
    const isSocial = ["linkedin", "twitter", "instagram"].includes(typeLower);
    const isEmail = typeLower === "email";
    const isArticle = ["article", "blog", "publication"].includes(typeLower);

    const prompt = `
Tu es un expert en marketing digital et rédaction. Génère un contenu de type "${type}" sur le sujet suivant : "${topic}".

Contexte :
${description || "Pas de contexte fourni."}

Instructions :
${
  isSocial
    ? `- Crée un post engageant, structuré avec une accroche, un développement et un call-to-action.
- Utilise un ton dynamique et professionnel.
- Ajoute des emojis et hashtags pertinents.
- Pas de balises Markdown ni de code.`
    : ""
}

${
  isEmail
    ? `- Rédige un email clair et convaincant.
- Structure : objet, introduction, corps, conclusion.
- Ton professionnel et personnalisé.`
    : ""
}
${
  isArticle
    ? `
Tu es un expert en rédaction de contenu web. Tu dois générer un article de blog structuré en Markdown, inspiré de vrais blogs professionnels.

Voici les consignes spécifiques à suivre :

- Ne commence pas par une section intitulée "Introduction" ni ne termine par "Conclusion".
- Utilise des titres et sous-titres pertinents en Markdown (##, ###).
- Intègre des images pertinentes en Markdown avec des URLs d’images réelles, valides et libres de droits.
- Pour chaque image, fais une recherche sur Internet et sélectionne une image libre de droit provenant de plateformes fiables comme :
  - https://www.pexels.com/search/seo/
  - https://unsplash.com/s/photos/seo
  - https://commons.wikimedia.org/wiki/Main_Page
- Vérifie que l’URL de l’image est bien accessible (pas de lien cassé ou 404).
- Si tu ne peux pas garantir qu’une image est valide et libre de droit, n’en insère pas.
- Chaque image doit avoir un texte alternatif descriptif et illustrer le propos de manière pertinente.
- Le contenu doit être en Markdown uniquement, sans HTML ni balises inutiles.
- Le ton doit être naturel, informatif, crédible et engageant.
`
    : ""
}





Langue : français.
Format : ${isArticle ? "Markdown" : "texte brut uniquement"}.
    `;

    try {
      const response = await fetch(`${llmApiUrl}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'appel à l'API LLM");
      }

      const { answer } = await response.json();
      setContent(answer);
      onGenerated?.(answer);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGenerate();
        }}
        className="w-full"
      >
        <PlaceholdersAndVanishInput
          topic={topic}
          loading={loading}
          placeholders={[
            "Lancer un produit innovant",
            "Booster l'engagement sur Instagram",
            "Créer une newsletter impactante",
          ]}
          onChange={(e) => setTopic(e.target.value)}
        />
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {content && (
        <div className="mt-4 p-4 border rounded bg-muted">
          <pre className="whitespace-pre-wrap text-sm">{content}</pre>
        </div>
      )}
    </>
  );
}
