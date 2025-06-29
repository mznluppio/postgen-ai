"use client";

import Link from "next/link";
import { Spotlight } from "@/components/ui/spotlight";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Check } from "lucide-react";
import { MagicCard } from "@/components/magicui/magic-card";
import { CuicuiButton } from "@/components/ui/cuicui-button";
import { EldoraGradientText } from "@/components/ui/eldora-gradient-text";
import { AnimataCard } from "@/components/ui/animata-card";

export default function LandingPage() {
  const features = [
    "Génération de contenu multicanal",
    "Gestion de projets marketing",
    "Suivi d'usage et facturation simple",
  ];

  return (
    <div className="min-h-screen bg-black/[0.96] text-white relative overflow-hidden">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
      <BackgroundBeams />
      <div className="relative z-10 flex flex-col items-center px-4 py-20 space-y-12">
        <AnimataCard className="text-center space-y-4 max-w-2xl bg-neutral-950/50">
          <h1 className="text-5xl md:text-6xl font-bold">
            <EldoraGradientText>Postgen AI</EldoraGradientText>
          </h1>
          <p className="text-xl text-neutral-300">
            Créez du contenu qui captive et convertit, sans effort.
          </p>
          <CuicuiButton asChild size="lg" className="mt-4">
            <Link href="/auth">Commencer gratuitement</Link>
          </CuicuiButton>
        </AnimataCard>
        <section className="grid sm:grid-cols-3 gap-6 max-w-4xl">
          {features.map((feature) => (
            <MagicCard key={feature} className="p-4 bg-neutral-950/50">
              <div className="flex items-start space-x-2">
                <Check className="text-green-400 w-5 h-5 mt-1" />
                <span className="text-neutral-200">{feature}</span>
              </div>
            </MagicCard>
          ))}
        </section>
      </div>
    </div>
  );
}
