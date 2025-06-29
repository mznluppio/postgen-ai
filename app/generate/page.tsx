"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Sparkles,
  Eye,
  Hash,
  ArrowUpLeft,
  Palette,
  Image as ImageIcon,
  Layout,
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
import { Search } from "lucide-react";
import { authService } from "@/lib/auth";
import { checkLimit, incrementUsage } from "@/lib/saas";

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
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [isVisible, setIsVisible] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % suggestions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const generateContent = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setGeneratedContent(null);
    setLimitReached(false);

    const brandingData: BrandingData = {
      topic,
      logo: null,
      primaryColor: "#0080FF",
      secondaryColor: "#0066CC",
      tone,
    };

    try {
      if (
        currentOrganization &&
        !(await checkLimit(currentOrganization.$id, currentOrganization.plan as any))
      ) {
        setLimitReached(true);
        setIsGenerating(false);
        return;
      }
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...brandingData, organizationId: currentOrganization?.$id }),
      });

      if (response.ok) {
        const content = await response.json();
        setGeneratedContent(content);
        
        // Save content to database if user is authenticated
        if (user && currentOrganization) {
          try {
          await Promise.all([
            authService.saveContent({
              organizationId: currentOrganization.$id,
              topic,
              content: content.linkedinPost,
              type: "social",
            }),
            authService.saveContent({
              organizationId: currentOrganization.$id,
              topic,
              content: content.instagramPost,
              type: "social",
            }),
            authService.saveContent({
              organizationId: currentOrganization.$id,
              topic,
              content: JSON.stringify(content.carousel),
              type: "carousel",
            }),
          ]);
          await incrementUsage(currentOrganization.$id);
          } catch (e) {
            console.error("Erreur lors de la sauvegarde du contenu:", e);
          }
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
            {limitReached && (
              <p className="text-red-500 text-center mb-4">
                Limite atteinte pour votre plan actuel. Veuillez mettre à niveau votre abonnement.
              </p>
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