"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Palette,
  Layers,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Spotlight } from "@/components/ui/spotlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

const suggestions = [
  "Intelligence artificielle et productivité",
  "Marketing digital pour startups",
  "Développement durable en entreprise",
  "Leadership et management moderne",
  "Innovation technologique 2024",
  "Transformation digitale",
];

const features = [
  {
    title: "IA Précise",
    description:
      "Génération intelligente adaptée à votre secteur et votre audience cible",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50"></div>
    ),
    icon: <Target className="h-4 w-4 text-blue-500" />,
  },
  {
    title: "Branding Cohérent",
    description:
      "Identité visuelle unifiée sur toutes vos publications sociales",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/50 dark:to-violet-900/50"></div>
    ),
    icon: <Palette className="h-4 w-4 text-violet-500" />,
  },
  {
    title: "Multi-Format",
    description:
      "Posts, carrousels et stories optimisés pour chaque plateforme",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50"></div>
    ),
    icon: <Layers className="h-4 w-4 text-emerald-500" />,
  },
];

export default function Home() {
  const [topic, setTopic] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % suggestions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      localStorage.setItem("contentTopic", topic);
      router.push("/branding");
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setTopic(suggestion);
  };

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      {/* Background Effects */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      <BackgroundBeams />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div
          className={`w-full max-w-6xl transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          {/* Header */}
          <div className="text-center space-y-8 mb-16">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-3 mb-6">
                <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50 tracking-tight">
                  Postgen AI
                </h1>
              </div>

              <TextGenerateEffect
                words="Créez du contenu qui captive et convertit"
                className="text-2xl md:text-4xl text-center text-white"
              />

              <p className="text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                Intelligence artificielle locale • Branding personnalisé •
                Résultats professionnels
              </p>
            </div>
          </div>

          {/* Search Form */}
          <div className="space-y-8 mb-20">
            <form onSubmit={handleSubmit} className="relative group">
              <div className="relative">
                {/* Glow effect on focus */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />

                {/* Input container */}
                <div className="relative bg-neutral-950 border border-neutral-800 rounded-2xl p-1.5 group-focus-within:border-blue-500/50 transition-all duration-300">
                  <div className="flex items-center space-x-4 bg-neutral-900 rounded-xl p-4">
                    <Search className="w-6 h-6 text-neutral-400 group-focus-within:text-blue-500 transition-colors" />

                    <Input
                      type="text"
                      placeholder="Sur quel sujet voulez-vous créer du contenu ?"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="flex-1 bg-transparent border-none text-lg placeholder:text-neutral-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-white"
                    />
                    <button
                      type="submit"
                      disabled={!topic.trim()}
                      className="bg-slate-800 no-underline h-full group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  text-white inline-block"
                    >
                      <span className="absolute inset-0 overflow-hidden rounded-full">
                        <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      </span>
                      <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10 ">
                        <span>Créer</span>
                        <svg
                          fill="none"
                          height="16"
                          viewBox="0 0 24 24"
                          width="16"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10.75 8.75L14.25 12L10.75 15.25"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </div>
                      <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Suggestions */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-neutral-500">
                <span>Suggestion :</span>
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectSuggestion(suggestion)}
                    className={`px-4 py-2 text-sm rounded-full border transition-all duration-300 hover:scale-105 ${
                      index === currentSuggestion
                        ? "bg-blue-950/50 border-blue-500/50 text-blue-300"
                        : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-600"
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Features Bento Grid */}
          {/*     <BentoGrid className="max-w-4xl mx-auto">
            {features.map((item, i) => (
              <BentoGridItem
                key={i}
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                className={i === 3 || i === 6 ? "md:col-span-2" : ""}
              />
            ))}
          </BentoGrid>
          */}

          {/* CTA */}
          <div
            className="text-center mt-16 animate-fade-in"
            style={{ animationDelay: "0.8s" }}
          >
            <div className="inline-flex items-center space-x-2 text-neutral-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm">
                Prêt à transformer votre présence digitale ?
              </span>
              <div
                className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
