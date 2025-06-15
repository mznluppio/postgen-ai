"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Palette,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  ArrowUpLeft,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
          className={` mb-16 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center space-x-3 mb-6">
            <Sparkles className="w-6 h-6 text-blue-500" />
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
              Branding
            </h1>
          </div>

          <p className="text-xl text-neutral-300 mb-6">
            Définissez l&apos;identité de votre contenu
          </p>

          <div className="inline-flex items-center space-x-3 bg-neutral-950/50 backdrop-blur-xl border border-neutral-800 rounded-full px-6 py-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-blue-400 font-medium">
              &quot;{topic}&quot;
            </span>
          </div>
        </div>

        <div
          className={`max-w-6xl mx-auto grid lg:grid-cols-3 gap-8 transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          {/* Logo Upload */}
          <Card className="group hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 bg-neutral-950/50 backdrop-blur-xl border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-neutral-100">
                <div className="w-10 h-10 bg-blue-950/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5 text-blue-400" />
                </div>
                <span>Logo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="border-2 border-dashed border-neutral-700 rounded-2xl p-8 text-center hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden group/upload">
                  {logo ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <Image
                          src={logo}
                          alt="Logo"
                          width={100}
                          height={100}
                          className="max-h-24 mx-auto rounded-xl shadow-lg"
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setLogo(null)}
                        className="border-neutral-700 hover:border-blue-500 hover:text-blue-400"
                      >
                        Changer le logo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-neutral-400 mx-auto group-hover/upload:text-blue-500 transition-colors" />
                      <div>
                        <p className="text-neutral-300 font-medium">
                          Ajoutez votre logo
                        </p>
                        <p className="text-neutral-500 text-sm mt-1">
                          PNG, JPG, SVG • Max 5MB
                        </p>
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Palette */}
          <Card className="group hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 bg-neutral-950/50 backdrop-blur-xl border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-neutral-100">
                <div className="w-10 h-10 bg-violet-950/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Palette className="w-5 h-5 text-violet-400" />
                </div>
                <span>Couleurs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Presets */}
              <div className="grid grid-cols-3 gap-3">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => selectColorPreset(preset)}
                    className="group/preset relative p-3 rounded-xl border border-neutral-700 hover:border-neutral-600 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex space-x-2 mb-2">
                      <div
                        className="w-6 h-6 rounded-lg shadow-sm"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded-lg shadow-sm"
                        style={{ backgroundColor: preset.secondary }}
                      />
                    </div>
                    <span className="text-xs text-neutral-400 font-medium">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom Colors */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-neutral-300">Couleur Primaire</Label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-12 rounded-lg border border-neutral-700 cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="font-mono text-sm bg-neutral-900/50 border-neutral-700 text-neutral-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-neutral-300">Couleur Secondaire</Label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-12 h-12 rounded-lg border border-neutral-700 cursor-pointer"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="font-mono text-sm bg-neutral-900/50 border-neutral-700 text-neutral-300"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tone Selection */}
          <Card className="group hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 bg-neutral-950/50 backdrop-blur-xl border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-neutral-100">
                <div className="w-10 h-10 bg-emerald-950/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                </div>
                <span>Ton</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={tone}
                onValueChange={setTone}
                className="space-y-3"
              >
                {toneOptions.map((option) => (
                  <div key={option.value} className="relative group/tone">
                    <div className="flex items-center space-x-4 p-4 rounded-xl border border-neutral-700 hover:border-neutral-600 transition-all cursor-pointer group-hover/tone:shadow-sm">
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
                      {tone === option.value && (
                        <Check className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div
          className={`mt-16 max-w-4xl mx-auto transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <Card className="bg-neutral-950/50 backdrop-blur-xl border-neutral-800">
            <CardHeader>
              <CardTitle className="text-center text-neutral-100">
                Aperçu de votre identité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center space-x-8 p-8">
                {logo && (
                  <div className="relative">
                    <Image
                      src={logo}
                      alt="Logo"
                      width={100}
                      height={100}
                      className=" shadow-sm"
                    />
                  </div>
                )}

                <div className="flex space-x-3">
                  <div
                    className="w-12 h-12 rounded-lg shadow-sm border border-neutral-700"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div
                    className="w-12 h-12 rounded-lg shadow-sm border border-neutral-700"
                    style={{ backgroundColor: secondaryColor }}
                  />
                </div>

                <div className="text-center">
                  <div className="text-neutral-100 font-semibold text-lg mb-1">
                    {toneOptions.find((t) => t.value === tone)?.icon}{" "}
                    {toneOptions.find((t) => t.value === tone)?.label}
                  </div>
                  <div className="text-neutral-500 text-sm">
                    {toneOptions.find((t) => t.value === tone)?.description}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div
          className={`flex justify-between items-center mt-16 max-w-4xl mx-auto transition-all duration-1000 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="border-neutral-700 bg-black text-neutral-300 hover:border-neutral-600 px-6 py-2.5"
          >
            <ArrowUpLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <Button
            onClick={handleSubmit}
            className="bg-white text-black px-8 py-2.5 hover:text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
          >
            <span className="flex items-center space-x-2">
              <span>Continuer</span>
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
