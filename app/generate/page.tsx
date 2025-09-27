"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import AuthPage from "../auth/page";
import {
  Loader2,
  Copy,
  RefreshCw,
  Instagram,
  Linkedin,
  CheckCircle,
  Search,
  Sparkles,
  Eye,
  Hash,
  ArrowUpLeft,
  FileText,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BrandCarousel } from "@/components/ui/brand-carousel";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Spotlight } from "@/components/ui/spotlight";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROMPT_LIBRARY, PromptBrief, getPromptById } from "@/lib/prompts";

interface BrandingData {
  topic: string;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  tone: string;
  promptBrief?: PromptBrief | null;
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

interface GeneratedContent {
  linkedinPost: string;
  instagramPost: string;
  carousel: CarouselSlide[];
  hashtags: string[];
  source?: string;
}

const toneOptions = [
  {
    value: "professional",
    label: "Professionnel",
    description: "Expertise et autorité",
    icon: "💼",
  },
  {
    value: "friendly",
    label: "Amical",
    description: "Chaleur et proximité",
    icon: "🤝",
  },
  {
    value: "inspiring",
    label: "Inspirant",
    description: "Vision et motivation",
    icon: "🚀",
  },
  {
    value: "casual",
    label: "Décontracté",
    description: "Naturel et authentique",
    icon: "😊",
  },
];

const suggestions = [
  "Intelligence artificielle et productivité",
  "Marketing digital pour startups",
  "Développement durable en entreprise",
  "Leadership et management moderne",
  "Innovation technologique 2024",
  "Transformation digitale",
];

export default function Generate() {
  const { user, currentOrganization } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");

  const selectedPrompt = useMemo(
    () => getPromptById(selectedPromptId),
    [selectedPromptId],
  );

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const promptId = searchParams.get("promptId");
    if (!promptId || promptId === selectedPromptId) {
      return;
    }

    const prompt = getPromptById(promptId);
    if (prompt) {
      setSelectedPromptId(prompt.id);
    }
  }, [searchParams, selectedPromptId]);

  useEffect(() => {
    if (selectedPrompt) {
      setTone(selectedPrompt.tone);
    }
  }, [selectedPrompt]);

  const generateContent = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setGeneratedContent(null);

    const brandingData: BrandingData = {
      topic,
      logo: null,
      primaryColor: "#0080FF",
      secondaryColor: "#0066CC",
      tone,
      promptBrief: selectedPrompt ?? null,
    };

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(brandingData),
      });

      if (response.ok) {
        const content = await response.json();
        setGeneratedContent(content);
        
        // Save content to database if user is authenticated
        if (user && currentOrganization) {
          // TODO: Save to database using authService.saveContent
        }
      } else {
        throw new Error("Erreur lors de la génération");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setGeneratedContent({
        linkedinPost: `Erreur lors de la génération du contenu. Veuillez réessayer.`,
        instagramPost: `Erreur lors de la génération du contenu. Veuillez réessayer.`,
        carousel: [
          {
            title: "Erreur",
            content: "Impossible de générer le contenu",
            imagePrompt: "Erreur de génération",
            visualElements: {
              backgroundColor: "#f3f4f6",
              textColor: "#374151",
              accentColor: "#ef4444",
              layout: "text-focus",
            },
          },
        ],
        hashtags: [`#${topic.replace(/\s+/g, "")}`],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateContent();
  };

  return (
    <AuthGuard fallback={<AuthPage />}>
      <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <BackgroundBeams />

        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className={`max-w-5xl mx-auto space-y-10 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <header className="flex flex-col gap-4 text-center">
              <h1 className="text-4xl md:text-5xl font-semibold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                Générateur de contenu
              </h1>
              <p className="text-lg text-neutral-300">
                Choisissez un brief, indiquez le sujet et laissez Postgen AI livrer des déclinaisons prêtes à publier.
              </p>
              {currentOrganization && (
                <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-neutral-800 bg-neutral-950/60 px-6 py-3 text-sm text-blue-300">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  {currentOrganization.name}
                </div>
              )}
            </header>

            <div className="grid gap-10 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] xl:items-start">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="border-neutral-800 bg-neutral-950/60 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-neutral-100">
                      <Search className="h-5 w-5 text-blue-400" />
                      Sujet de la campagne
                    </CardTitle>
                    <CardDescription className="text-neutral-400">
                      Décrivez votre idée en une phrase pour guider la génération.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Ex : Lancement de notre nouveau module d'automatisation"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="bg-neutral-900/80 border-neutral-800 text-neutral-100 placeholder:text-neutral-500"
                    />
                    <div className="flex flex-wrap gap-2 text-xs text-neutral-400">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => setTopic(suggestion)}
                          className="rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 transition hover:border-blue-500 hover:text-blue-300"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                    <Button
                      type="submit"
                      disabled={!topic.trim() || isGenerating}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Génération...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Générer le contenu
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-neutral-800 bg-neutral-950/60 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-neutral-100">
                      <FileText className="h-5 w-5 text-blue-400" />
                      Brief Postgen AI
                    </CardTitle>
                    <CardDescription className="text-neutral-400">
                      Sélectionnez un modèle pour pré-configurer le ton, les audiences et les objectifs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select
                      value={selectedPromptId || "none"}
                      onValueChange={(value) => setSelectedPromptId(value === "none" ? "" : value)}
                    >
                      <SelectTrigger className="border-neutral-800 bg-neutral-900/80 text-neutral-100">
                        <SelectValue placeholder="Sélectionnez un brief prêt à l'emploi" />
                      </SelectTrigger>
                      <SelectContent className="border-neutral-800 bg-neutral-900 text-neutral-100">
                        <SelectItem value="none">Sans brief prédéfini</SelectItem>
                        {PROMPT_LIBRARY.map((prompt) => (
                          <SelectItem key={prompt.id} value={prompt.id}>
                            {prompt.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-neutral-800 text-neutral-200 hover:bg-neutral-800"
                        onClick={() => setSelectedPromptId("")}
                        disabled={!selectedPromptId}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Réinitialiser
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="flex-1"
                        onClick={() => router.push("/dashboard/prompts")}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Explorer
                      </Button>
                    </div>
                    {selectedPrompt ? (
                      <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-left">
                        <p className="text-sm font-medium text-neutral-200">
                          {selectedPrompt.description}
                        </p>
                        <p className="text-sm leading-relaxed text-neutral-400">
                          {selectedPrompt.instructions}
                        </p>
                        <Badge variant="secondary" className="w-fit capitalize">
                          Ton : {selectedPrompt.tone}
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 rounded-xl border border-dashed border-neutral-800 bg-neutral-900/50 p-4 text-sm text-neutral-400">
                        <Info className="h-4 w-4" />
                        Sélectionnez un brief pour partager des consignes précises avec l'IA.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-neutral-800 bg-neutral-950/60 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-neutral-100">Ton de communication</CardTitle>
                    <CardDescription className="text-neutral-400">
                      Choisissez l'intonation à appliquer aux différentes déclinaisons.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={tone} onValueChange={setTone} className="grid grid-cols-2 gap-3">
                      {toneOptions.map((option) => (
                        <label
                          key={option.value}
                          htmlFor={option.value}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 transition hover:border-blue-500"
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={option.value}
                            className="border-neutral-400 text-blue-500"
                          />
                          <div className="text-left">
                            <p className="text-sm font-medium text-neutral-100">
                              {option.icon} {option.label}
                            </p>
                            <p className="text-xs text-neutral-400">{option.description}</p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              </form>

              <div className="space-y-6">
                <Card className="border-neutral-800 bg-neutral-950/60 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-neutral-100">
                      <Eye className="h-5 w-5 text-blue-400" />
                      Aperçu en direct
                    </CardTitle>
                    <CardDescription className="text-neutral-400">
                      Consultez toutes les déclinaisons générées et copiez-les en un clic.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isGenerating ? (
                      <div className="flex flex-col items-center gap-4 py-12 text-neutral-300">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                        <p>Génération du contenu en cours…</p>
                      </div>
                    ) : generatedContent ? (
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 gap-1 rounded-xl border border-neutral-800 bg-neutral-900/60 p-1">
                          <TabsTrigger value="posts" className="rounded-lg data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100">
                            Publications
                          </TabsTrigger>
                          <TabsTrigger value="carousel" className="rounded-lg data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100">
                            Carrousel
                          </TabsTrigger>
                          <TabsTrigger value="hashtags" className="rounded-lg data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100">
                            Hashtags
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="posts" className="space-y-6 pt-6">
                          <div className="grid gap-6 lg:grid-cols-2">
                            <Card className="border-neutral-800 bg-neutral-900/60">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-neutral-100">
                                  <Linkedin className="h-5 w-5 text-blue-400" />
                                  LinkedIn
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="max-h-80 overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-950/70 p-5 text-sm text-neutral-200">
                                  {generatedContent.linkedinPost}
                                </div>
                                <Button
                                  onClick={() => copyToClipboard(generatedContent.linkedinPost, "linkedin")}
                                  className="w-full"
                                >
                                  {copiedItem === "linkedin" ? (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Copié !
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="mr-2 h-4 w-4" />
                                      Copier le post
                                    </>
                                  )}
                                </Button>
                              </CardContent>
                            </Card>

                            <Card className="border-neutral-800 bg-neutral-900/60">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-neutral-100">
                                  <Instagram className="h-5 w-5 text-pink-400" />
                                  Instagram
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="max-h-80 overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-950/70 p-5 text-sm text-neutral-200">
                                  {generatedContent.instagramPost}
                                </div>
                                <Button
                                  onClick={() => copyToClipboard(generatedContent.instagramPost, "instagram")}
                                  className="w-full"
                                >
                                  {copiedItem === "instagram" ? (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Copié !
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="mr-2 h-4 w-4" />
                                      Copier le post
                                    </>
                                  )}
                                </Button>
                              </CardContent>
                            </Card>
                          </div>
                        </TabsContent>

                        <TabsContent value="carousel" className="pt-6">
                          <BrandCarousel
                            slides={generatedContent.carousel}
                            branding={{
                              topic,
                              logo: null,
                              primaryColor: "#0080FF",
                              secondaryColor: "#0066CC",
                              tone,
                            }}
                            autoPlay
                            autoPlayInterval={5000}
                          />
                        </TabsContent>

                        <TabsContent value="hashtags" className="space-y-4 pt-6">
                          <div className="flex flex-wrap gap-3">
                            {generatedContent.hashtags.map((hashtag, index) => (
                              <button
                                key={index}
                                onClick={() => copyToClipboard(hashtag, `hashtag-${index}`)}
                                className="rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-blue-300 transition hover:border-blue-500"
                              >
                                {hashtag}
                              </button>
                            ))}
                          </div>
                          <Button
                            onClick={() => copyToClipboard(generatedContent.hashtags.join(" "), "hashtags")}
                            className="w-full"
                          >
                            {copiedItem === "hashtags" ? (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Copié !
                              </>
                            ) : (
                              <>
                                <Copy className="mr-2 h-4 w-4" />
                                Copier tous les hashtags
                              </>
                            )}
                          </Button>
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <div className="space-y-4 rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 p-8 text-center text-neutral-400">
                        <Sparkles className="mx-auto h-6 w-6 text-blue-400" />
                        <p>
                          Lancez une génération pour visualiser les déclinaisons LinkedIn, Instagram et vos hashtags optimisés.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex flex-wrap justify-between gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    className="border-neutral-800 bg-black text-neutral-300 hover:text-white"
                  >
                    <ArrowUpLeft className="mr-2 h-4 w-4" />
                    Retour au dashboard
                  </Button>
                  {generatedContent && (
                    <Button onClick={generateContent} disabled={isGenerating || !topic.trim()}>
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Génération...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Régénérer
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}