"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import Image from "next/image";

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

interface GeneratedContent {
  linkedinPost: string;
  instagramPost: string;
  carousel: CarouselSlide[];
  hashtags: string[];
  source?: string;
}

export default function Generate() {
  const [brandingData, setBrandingData] = useState<BrandingData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] =
    useState<GeneratedContent | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedBranding = localStorage.getItem("brandingData");
    if (savedBranding) {
      setBrandingData(JSON.parse(savedBranding));
      generateContent(JSON.parse(savedBranding));
      setIsVisible(true);
    } else {
      router.push("/");
    }
  }, [router]);

  const generateContent = async (branding: BrandingData) => {
    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(branding),
      });

      if (response.ok) {
        const content = await response.json();
        setGeneratedContent(content);
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
              layout: 'text-focus'
            }
          },
        ],
        hashtags: [`#${branding.topic.replace(/\s+/g, "")}`],
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

  const regenerateContent = () => {
    if (brandingData) {
      generateContent(brandingData);
    }
  };

  const copyCarouselContent = () => {
    if (generatedContent) {
      const carouselText = generatedContent.carousel
        .map((slide, i) => {
          return `Slide ${i + 1}: ${slide.title}
Contenu: ${slide.content}
Image: ${slide.imagePrompt}
Layout: ${slide.visualElements.layout}
---`;
        })
        .join("\n\n");
      
      copyToClipboard(carouselText, "carousel");
    }
  };

  if (!brandingData) {
    return (
      <div className="min-h-screen bg-black/[0.96] flex items-center justify-center">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          <div className="absolute inset-0 w-12 h-12 border border-blue-500/20 rounded-full animate-ping" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      {/* Background Effects */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      <BackgroundBeams />

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div
          className={` mb-12 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center space-x-3 mb-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
              Contenu Généré
            </h1>
          </div>

          <p className="text-xl text-neutral-300 mb-8">
            Votre contenu personnalisé est prêt avec design automatique
          </p>

          {/* Branding Preview */}
          <div className="inline-flex items-center space-x-6 bg-neutral-950/50 backdrop-blur-xl border border-neutral-800 rounded-2xl px-8 py-4">
            {brandingData.logo && (
              <div className="relative">
                <Image
                  src={brandingData.logo}
                  alt="Logo"
                  width={100}
                  height={100}
                />
              </div>
            )}
            <div className="flex space-x-2">
              <div
                className="w-4 h-4 rounded-full shadow-sm"
                style={{ backgroundColor: brandingData.primaryColor }}
              />
              <div
                className="w-4 h-4 rounded-full shadow-sm"
                style={{ backgroundColor: brandingData.secondaryColor }}
              />
            </div>
            <Badge
              variant="outline"
              className="border-neutral-700 text-neutral-400"
            >
              {brandingData.tone}
            </Badge>
            <div className="flex items-center space-x-2 text-blue-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">
                "{brandingData.topic}"
              </span>
            </div>
            {generatedContent?.source && (
              <Badge
                variant="outline"
                className={`${
                  generatedContent.source === "ollama"
                    ? "text-emerald-400 border-emerald-700"
                    : "text-amber-400 border-amber-700"
                }`}
              >
                {generatedContent.source === "ollama"
                  ? "🤖 IA Locale"
                  : "⚡ Fallback"}
              </Badge>
            )}
          </div>
        </div>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full animate-spin">
                <div className="absolute top-0 left-0 w-4 h-4 bg-blue-500 rounded-full" />
              </div>
              <div
                className="absolute inset-0 w-20 h-20 border-4 border-violet-500/20 rounded-full animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "2s",
                }}
              >
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-violet-500 rounded-full" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-neutral-100 mb-4">
              Génération en cours...
            </h3>
            <p className="text-neutral-400 text-lg mb-2">
              L&apos;IA crée votre contenu personnalisé avec design automatique
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 text-blue-400">
                <Palette className="w-4 h-4" />
                <span>Design visuel...</span>
              </div>
              <div className="flex items-center space-x-2 text-violet-400">
                <ImageIcon className="w-4 h-4" />
                <span>Images générées...</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-400">
                <Layout className="w-4 h-4" />
                <span>Layouts optimisés...</span>
              </div>
            </div>
          </div>
        ) : generatedContent ? (
          <div
            className={`max-w-7xl mx-auto transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-neutral-950/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-1.5 mb-8">
                <TabsTrigger
                  value="posts"
                  className="data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100 rounded-xl transition-all duration-300"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Publications
                </TabsTrigger>
                <TabsTrigger
                  value="carousel"
                  className="data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100 rounded-xl transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Carrousel Visuel
                </TabsTrigger>
                <TabsTrigger
                  value="hashtags"
                  className="data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100 rounded-xl transition-all duration-300"
                >
                  <Hash className="w-4 h-4 mr-2" />
                  Hashtags
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* LinkedIn Post */}
                  <Card className="group hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 bg-neutral-950/50 backdrop-blur-xl border-neutral-800">
                    <CardHeader>
                      <CardTitle className="text-neutral-100 flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-950/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Linkedin className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-xl">LinkedIn</span>
                        <Badge
                          variant="outline"
                          className="border-blue-700 text-blue-400"
                        >
                          Professionnel
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="relative">
                        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 max-h-96 overflow-y-auto">
                          <pre className="text-neutral-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                            {generatedContent.linkedinPost}
                          </pre>
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          copyToClipboard(
                            generatedContent.linkedinPost,
                            "linkedin",
                          )
                        }
                        className="w-full bg-blue-950/50 text-blue-400 hover:bg-blue-950/70 border border-blue-800 transition-all duration-300"
                      >
                        {copiedItem === "linkedin" ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Copié !
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copier le post LinkedIn
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Instagram Post */}
                  <Card className="group hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300 bg-neutral-950/50 backdrop-blur-xl border-neutral-800">
                    <CardHeader>
                      <CardTitle className="text-neutral-100 flex items-center space-x-3">
                        <div className="w-10 h-10 bg-pink-950/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Instagram className="w-5 h-5 text-pink-400" />
                        </div>
                        <span className="text-xl">Instagram</span>
                        <Badge
                          variant="outline"
                          className="border-pink-700 text-pink-400"
                        >
                          Créatif
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="relative">
                        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 max-h-96 overflow-y-auto">
                          <pre className="text-neutral-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                            {generatedContent.instagramPost}
                          </pre>
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          copyToClipboard(
                            generatedContent.instagramPost,
                            "instagram",
                          )
                        }
                        className="w-full bg-pink-950/50 text-pink-400 hover:bg-pink-950/70 border border-pink-800 transition-all duration-300"
                      >
                        {copiedItem === "instagram" ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Copié !
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copier le post Instagram
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="carousel" className="space-y-8">
                {/* Carousel Info */}
                <Card className="bg-neutral-950/50 backdrop-blur-xl border-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-neutral-100 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-violet-950/50 rounded-xl flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-violet-400" />
                        </div>
                        <span className="text-2xl">Carrousel Interactif</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-violet-700 text-violet-400">
                          {generatedContent.carousel.length} slides
                        </Badge>
                        <Badge variant="outline" className="border-emerald-700 text-emerald-400">
                          Design automatique
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center space-x-3 p-3 bg-neutral-900/50 rounded-xl">
                        <Palette className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="text-sm font-medium text-neutral-200">Couleurs adaptées</div>
                          <div className="text-xs text-neutral-500">Branding cohérent</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-neutral-900/50 rounded-xl">
                        <ImageIcon className="w-5 h-5 text-violet-400" />
                        <div>
                          <div className="text-sm font-medium text-neutral-200">Images générées</div>
                          <div className="text-xs text-neutral-500">Visuels automatiques</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-neutral-900/50 rounded-xl">
                        <Layout className="w-5 h-5 text-emerald-400" />
                        <div>
                          <div className="text-sm font-medium text-neutral-200">Layouts variés</div>
                          <div className="text-xs text-neutral-500">5 styles différents</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <BrandCarousel
                  slides={generatedContent.carousel}
                  branding={brandingData}
                  autoPlay={true}
                  autoPlayInterval={5000}
                />

                {/* Copy Button */}
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={copyCarouselContent}
                    className="bg-violet-950/50 text-violet-400 hover:bg-violet-950/70 border border-violet-800 px-8 py-3"
                  >
                    {copiedItem === "carousel" ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Carrousel copié !
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-2" />
                        Copier le contenu complet
                      </>
                    )}
                  </Button>
                </div>

                {/* Slides Details */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedContent.carousel.map((slide, index) => (
                    <Card key={index} className="bg-neutral-950/50 backdrop-blur-xl border-neutral-800">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="border-neutral-700 text-neutral-400">
                            Slide {index + 1}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className="border-violet-700 text-violet-400 text-xs"
                          >
                            {slide.visualElements.layout}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <h4 className="font-semibold text-neutral-200 text-sm">
                          {slide.title}
                        </h4>
                        <p className="text-xs text-neutral-400 line-clamp-3">
                          {slide.content}
                        </p>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: slide.visualElements.textColor }}
                          />
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: slide.visualElements.accentColor }}
                          />
                          <span className="text-xs text-neutral-500">Couleurs auto</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="hashtags" className="space-y-8">
                <Card className="bg-neutral-950/50 backdrop-blur-xl border-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-neutral-100 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-950/50 rounded-xl flex items-center justify-center">
                          <Hash className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-2xl">Hashtags Optimisés</span>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-emerald-700 text-emerald-400"
                      >
                        {generatedContent.hashtags.length} hashtags
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Hashtags Display */}
                    <div className="flex flex-wrap gap-3">
                      {generatedContent.hashtags.map((hashtag, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            copyToClipboard(hashtag, `hashtag-${index}`)
                          }
                          className="group relative px-4 py-2 bg-neutral-900/50 border border-neutral-800 rounded-xl hover:border-neutral-700 hover:bg-neutral-800/50 transition-all duration-300"
                        >
                          <span className="text-blue-400 font-medium">
                            {hashtag}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Copy Actions */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button
                        onClick={() =>
                          copyToClipboard(
                            generatedContent.hashtags.join(" "),
                            "hashtags",
                          )
                        }
                        className="bg-blue-950/50 text-blue-400 hover:bg-blue-950/70 border border-blue-800 py-3"
                      >
                        {copiedItem === "hashtags" ? (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Copié !
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5 mr-2" />
                            Copier (espacés)
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() =>
                          copyToClipboard(
                            generatedContent.hashtags.join("\n"),
                            "hashtags-lines",
                          )
                        }
                        className="border-neutral-700 bg-black text-neutral-300 py-3"
                      >
                        {copiedItem === "hashtags-lines" ? (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Copié !
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5 mr-2" />
                            Copier (ligne par ligne)
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : null}

        {/* Action Bar */}
        <div
          className={`flex justify-between items-center mt-16 max-w-7xl mx-auto transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <Button
            variant="outline"
            onClick={() => router.push("/branding")}
            className="border-neutral-700 bg-black text-neutral-300 px-8  "
          >
            <ArrowUpLeft className="w-4 h-4 mr-2" />
            Modifier le branding
          </Button>

          {generatedContent && (
            <Button
              onClick={regenerateContent}
              disabled={isGenerating}
              className="bg-emerald-950/50 text-emerald-400 hover:bg-emerald-950/70 border border-emerald-800 px-8 py-2.5"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Régénérer tout
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}