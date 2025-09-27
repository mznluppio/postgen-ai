"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Palette,
  MessageSquare,
  Sparkles,
  ArrowUpLeft,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Spotlight } from "@/components/ui/spotlight";
import Image from "next/image";

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

const colorPresets = [
  { name: "Océan", primary: "#0080FF", secondary: "#0066CC" },
  { name: "Forêt", primary: "#00CC66", secondary: "#00AA55" },
  { name: "Sunset", primary: "#FF6B35", secondary: "#E55A2B" },
  { name: "Violet", primary: "#8B5CF6", secondary: "#7C3AED" },
  { name: "Rose", primary: "#EC4899", secondary: "#DB2777" },
  { name: "Émeraude", primary: "#10B981", secondary: "#059669" },
];

export default function Branding() {
  const [topic, setTopic] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#0080FF");
  const [secondaryColor, setSecondaryColor] = useState("#0066CC");
  const [tone, setTone] = useState("professional");
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedTopic = localStorage.getItem("contentTopic");
    if (savedTopic) {
      setTopic(savedTopic);
      setIsVisible(true);
    } else {
      router.push("/");
    }
  }, [router]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const brandingData = {
      topic,
      logo,
      primaryColor,
      secondaryColor,
      tone,
    };
    localStorage.setItem("brandingData", JSON.stringify(brandingData));
    router.push("/generate");
  };

  const selectColorPreset = (preset: (typeof colorPresets)[0]) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black/[0.96] bg-grid-white/[0.02] antialiased">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
      <BackgroundBeams />

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className={`mx-auto max-w-6xl space-y-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "translate-y-6 opacity-0"}`}>
          <header className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 text-blue-300">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Identité de campagne
              </span>
            </div>
            <h1 className="text-4xl font-semibold text-neutral-50 md:text-5xl">
              Personnalisez votre univers de marque
            </h1>
            <p className="text-lg text-neutral-300">
              Alignez ton, palette et assets pour guider la génération de contenu Postgen AI.
            </p>
            {topic && (
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/60 px-5 py-2 text-sm text-blue-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                {topic}
              </div>
            )}
          </header>

          <div className="grid gap-10 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] xl:items-start">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <Card className="border-neutral-800 bg-neutral-950/60 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-neutral-100">
                    <Upload className="h-5 w-5 text-blue-400" />
                    Logo et assets
                  </CardTitle>
                  <CardDescription className="text-neutral-400">
                    Importez votre logo pour que Postgen AI réutilise vos visuels clés.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-neutral-800 bg-neutral-900/60 p-8 text-center transition hover:border-blue-500/60">
                      {logo ? (
                        <div className="space-y-4">
                          <Image src={logo} alt="Logo" width={100} height={100} className="mx-auto max-h-24 rounded-xl shadow" />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setLogo(null)}
                            className="border-neutral-800 text-neutral-200 hover:bg-neutral-800"
                          >
                            Retirer le logo
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4 text-neutral-400">
                          <Upload className="mx-auto h-10 w-10" />
                          <div>
                            <p className="font-medium text-neutral-200">Déposez votre logo</p>
                            <p className="text-sm">PNG, JPG ou SVG · 5MB max</p>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-neutral-800 bg-neutral-950/60 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-neutral-100">
                    <Palette className="h-5 w-5 text-violet-400" />
                    Palette de couleurs
                  </CardTitle>
                  <CardDescription className="text-neutral-400">
                    Sélectionnez des presets ou affinez vos codes hexadécimaux.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-3">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => selectColorPreset(preset)}
                        className={`rounded-xl border px-3 py-2 text-left text-xs text-neutral-300 transition hover:border-violet-500 ${
                          primaryColor === preset.primary && secondaryColor === preset.secondary
                            ? "border-violet-500 bg-violet-500/10"
                            : "border-neutral-800 bg-neutral-900/60"
                        }`}
                      >
                        <div className="mb-2 flex gap-2">
                          <span
                            className="h-5 w-5 rounded-md"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <span
                            className="h-5 w-5 rounded-md"
                            style={{ backgroundColor: preset.secondary }}
                          />
                        </div>
                        {preset.name}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4 text-sm text-neutral-300">
                    <div className="space-y-2">
                      <Label>Couleur primaire</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="h-12 w-12 cursor-pointer rounded-lg border border-neutral-700"
                        />
                        <Input
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-full border-neutral-800 bg-neutral-900/60 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Couleur secondaire</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="h-12 w-12 cursor-pointer rounded-lg border border-neutral-700"
                        />
                        <Input
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-full border-neutral-800 bg-neutral-900/60 font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-neutral-800 bg-neutral-950/60 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-neutral-100">
                    <MessageSquare className="h-5 w-5 text-emerald-400" />
                    Ton éditorial
                  </CardTitle>
                  <CardDescription className="text-neutral-400">
                    Choisissez l'attitude qui représentera votre marque sur chaque canal.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={tone} onValueChange={setTone} className="space-y-3">
                    {toneOptions.map((option) => (
                      <label
                        key={option.value}
                        htmlFor={option.value}
                        className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition hover:border-emerald-500 ${
                          tone === option.value
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-neutral-800 bg-neutral-900/60"
                        }`}
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                          className="border-neutral-400 text-emerald-400"
                        />
                        <div>
                          <p className="text-sm font-semibold text-neutral-100">
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
                  <CardTitle className="text-neutral-100">Aperçu instantané</CardTitle>
                  <CardDescription className="text-neutral-400">
                    Visualisez comment Postgen AI utilisera vos choix de branding.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap items-center justify-center gap-6">
                    {logo && (
                      <Image src={logo} alt="Logo" width={96} height={96} className="rounded-xl border border-neutral-800 bg-white/10 p-4" />
                    )}
                    <div className="flex gap-3">
                      <span
                        className="h-12 w-12 rounded-lg border border-neutral-700"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <span
                        className="h-12 w-12 rounded-lg border border-neutral-700"
                        style={{ backgroundColor: secondaryColor }}
                      />
                    </div>
                    <div className="text-center text-neutral-200">
                      <p className="text-lg font-semibold">
                        {toneOptions.find((t) => t.value === tone)?.icon}{" "}
                        {toneOptions.find((t) => t.value === tone)?.label}
                      </p>
                      <p className="text-sm text-neutral-400">
                        {toneOptions.find((t) => t.value === tone)?.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 text-sm text-neutral-300">
                    <div className="flex items-center justify-between">
                      <span>Campagne</span>
                      <span className="font-medium text-neutral-100">{topic || "Définissez votre sujet"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tonalité</span>
                      <span className="font-medium text-neutral-100">
                        {toneOptions.find((t) => t.value === tone)?.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Couleurs</span>
                      <span className="font-mono text-xs text-neutral-400">
                        {primaryColor} / {secondaryColor}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-neutral-800 bg-neutral-950/60 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-neutral-100">Étapes suivantes</CardTitle>
                  <CardDescription className="text-neutral-400">
                    Une fois satisfait, passez à la génération de contenu multi-format.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-neutral-300">
                  <p>
                    Vous pourrez toujours ajuster ces paramètres depuis le dashboard. Ils alimentent vos briefs, prompts et modèles de carrousel.
                  </p>
                  <div className="flex flex-wrap justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/")}
                      className="border-neutral-800 bg-black text-neutral-300 hover:text-white"
                    >
                      <ArrowUpLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                    <Button onClick={handleSubmit} className="bg-white text-black hover:bg-neutral-200">
                      Continuer vers la génération
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
