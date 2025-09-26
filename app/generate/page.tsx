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
  ArrowLeft,
  CheckCircle,
  Search,
  Sparkles,
  Eye,
  Hash,
  ArrowUpLeft,
  Palette,
  Image as ImageIcon,
  Layout,
  FileText,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BrandCarousel } from "@/components/ui/brand-carousel";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Spotlight } from "@/components/ui/spotlight";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [currentSuggestion, setCurrentSuggestion] = useState(0);
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");

  const selectedPrompt = useMemo(
    () => getPromptById(selectedPromptId),
    [selectedPromptId],
  );

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % suggestions.length);
    }, 3000);
    return () => clearInterval(interval);
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

  const selectSuggestion = (suggestion: string) => {
    setTopic(suggestion);
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
          {/* Header */}
          <div className={`mb-12 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center space-x-3 mb-6">
              <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                Générateur de Contenu
              </h1>
            </div>

            <p className="text-xl text-neutral-300 mb-8">
              Créez du contenu professionnel en quelques secondes
            </p>

            {currentOrganization && (
              <div className="inline-flex items-center space-x-3 bg-neutral-950/50 backdrop-blur-xl border border-neutral-800 rounded-full px-6 py-3 mb-8">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-blue-400 font-medium">
                  {currentOrganization.name}
                </span>
              </div>
            )}

            {/* Generation Form */}
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Topic Input */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
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
                      <Button
                        type="submit"
                        disabled={!topic.trim() || isGenerating}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Génération...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Générer
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="text-center space-y-4">
                  <p className="text-neutral-500 text-sm">Suggestions :</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
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

                {/* Prompt Library Selection */}
                <Card className="bg-neutral-950/50 backdrop-blur-xl border-neutral-800">
                  <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-neutral-100 text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-400" />
                        Brief de campagne
                      </CardTitle>
                      {selectedPrompt && (
                        <Badge variant="secondary" className="capitalize">
                          {selectedPrompt.tone}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-neutral-400">
                      Choisissez un template de brief aligné avec les promesses de Postgen AI ou explorez la bibliothèque.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
                      <div className="w-full md:w-2/3">
                        <Select
                          value={selectedPromptId || "none"}
                          onValueChange={(value) =>
                            setSelectedPromptId(value === "none" ? "" : value)
                          }
                        >
                          <SelectTrigger className="bg-neutral-900/80 border-neutral-700 text-neutral-100">
                            <SelectValue placeholder="Sélectionnez un brief prêt à l'emploi" />
                          </SelectTrigger>
                          <SelectContent className="bg-neutral-900/95 border-neutral-700 text-neutral-100">
                            <SelectItem value="none">Sans brief prédéfini</SelectItem>
                            {PROMPT_LIBRARY.map((prompt) => (
                              <SelectItem key={prompt.id} value={prompt.id}>
                                {prompt.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex w-full items-center justify-between gap-3 md:w-1/3">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 gap-2 border-neutral-700 text-neutral-200 hover:bg-neutral-800"
                          onClick={() => setSelectedPromptId("")}
                          disabled={!selectedPromptId}
                        >
                          <RefreshCw className="h-4 w-4" />
                          Réinitialiser
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          className="flex-1 gap-2"
                          onClick={() => router.push("/dashboard/prompts")}
                        >
                          <Sparkles className="h-4 w-4" />
                          Explorer
                        </Button>
                      </div>
                    </div>
                    {selectedPrompt ? (
                      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-left">
                        <p className="text-sm text-neutral-200 font-medium">
                          {selectedPrompt.description}
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                          {selectedPrompt.instructions}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 p-4 text-sm text-neutral-400">
                        <Info className="h-4 w-4" />
                        Sélectionnez un brief pour pré-remplir les instructions envoyées à l'IA et garder une cohérence éditoriale.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tone Selection */}
                <Card className="bg-neutral-950/50 backdrop-blur-xl border-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-neutral-100">Ton de communication</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={tone} onValueChange={setTone} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {toneOptions.map((option) => (
                        <div key={option.value} className="relative">
                          <div className="flex items-center space-x-4 p-4 rounded-xl border border-neutral-700 hover:border-neutral-600 transition-all cursor-pointer">
                            <RadioGroupItem
                              value={option.value}
                              id={option.value}
                              className="border-neutral-400 text-blue-600"
                            />
                            <div className="text-xl">{option.icon}</div>
                            <div className="flex-1">
                              <Label
                                htmlFor={option.value}
                                className="text-neutral-100 font-medium cursor-pointer"
                              >
                                {option.label}
                              </Label>
                              <p className="text-neutral-500 text-sm mt-0.5">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              </form>
            </div>
          </div>

          {/* Generated Content */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative mb-8">
                <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full animate-spin">
                  <div className="absolute top-0 left-0 w-4 h-4 bg-blue-500 rounded-full" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-neutral-100 mb-4">
                Génération en cours...
              </h3>
              <p className="text-neutral-400 text-lg">
                L'IA crée votre contenu personnalisé
              </p>
            </div>
          )}

          {generatedContent && !isGenerating && (
            <div className="max-w-7xl mx-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-neutral-950/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-1.5 mb-8">
                  <TabsTrigger value="posts" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100 rounded-xl">
                    <Eye className="w-4 h-4 mr-2" />
                    Publications
                  </TabsTrigger>
                  <TabsTrigger value="carousel" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100 rounded-xl">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Carrousel
                  </TabsTrigger>
                  <TabsTrigger value="hashtags" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100 rounded-xl">
                    <Hash className="w-4 h-4 mr-2" />
                    Hashtags
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="space-y-8">
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* LinkedIn Post */}
                    <Card className="bg-neutral-950/50 backdrop-blur-xl border-neutral-800">
                      <CardHeader>
                        <CardTitle className="text-neutral-100 flex items-center space-x-3">
                          <Linkedin className="w-5 h-5 text-blue-400" />
                          <span>LinkedIn</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 max-h-96 overflow-y-auto">
                          <pre className="text-neutral-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                            {generatedContent.linkedinPost}
                          </pre>
                        </div>
                        <Button
                          onClick={() => copyToClipboard(generatedContent.linkedinPost, "linkedin")}
                          className="w-full"
                        >
                          {copiedItem === "linkedin" ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Copié !
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copier
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Instagram Post */}
                    <Card className="bg-neutral-950/50 backdrop-blur-xl border-neutral-800">
                      <CardHeader>
                        <CardTitle className="text-neutral-100 flex items-center space-x-3">
                          <Instagram className="w-5 h-5 text-pink-400" />
                          <span>Instagram</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 max-h-96 overflow-y-auto">
                          <pre className="text-neutral-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                            {generatedContent.instagramPost}
                          </pre>
                        </div>
                        <Button
                          onClick={() => copyToClipboard(generatedContent.instagramPost, "instagram")}
                          className="w-full"
                        >
                          {copiedItem === "instagram" ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Copié !
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copier
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="carousel" className="space-y-8">
                  <BrandCarousel
                    slides={generatedContent.carousel}
                    branding={{
                      topic,
                      logo: null,
                      primaryColor: "#0080FF",
                      secondaryColor: "#0066CC",
                      tone,
                    }}
                    autoPlay={true}
                    autoPlayInterval={5000}
                  />
                </TabsContent>

                <TabsContent value="hashtags" className="space-y-8">
                  <Card className="bg-neutral-950/50 backdrop-blur-xl border-neutral-800">
                    <CardHeader>
                      <CardTitle className="text-neutral-100">Hashtags optimisés</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-wrap gap-3">
                        {generatedContent.hashtags.map((hashtag, index) => (
                          <button
                            key={index}
                            onClick={() => copyToClipboard(hashtag, `hashtag-${index}`)}
                            className="px-4 py-2 bg-neutral-900/50 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all"
                          >
                            <span className="text-blue-400 font-medium">{hashtag}</span>
                          </button>
                        ))}
                      </div>
                      <Button
                        onClick={() => copyToClipboard(generatedContent.hashtags.join(" "), "hashtags")}
                        className="w-full"
                      >
                        {copiedItem === "hashtags" ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Copié !
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copier tous les hashtags
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-16 max-w-7xl mx-auto">
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="border-neutral-700 bg-black text-neutral-300">
              <ArrowUpLeft className="w-4 h-4 mr-2" />
              Retour au dashboard
            </Button>

            {generatedContent && (
              <Button onClick={generateContent} disabled={isGenerating || !topic.trim()}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Régénérer
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}