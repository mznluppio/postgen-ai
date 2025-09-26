"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { filterPrompts, PromptBrief } from "@/lib/prompts";
import { Search, Sparkles, Filter, ExternalLink } from "lucide-react";

const toneFilters: { value: "all" | PromptBrief["tone"]; label: string; description: string }[] = [
  { value: "all", label: "Tous les tons", description: "Afficher tous les briefs" },
  { value: "professional", label: "Professionnel", description: "Crédible et structuré" },
  { value: "friendly", label: "Amical", description: "Chaleureux et accessible" },
  { value: "inspiring", label: "Inspirant", description: "Visionnaire et motivant" },
  { value: "casual", label: "Décontracté", description: "Naturel et spontané" },
];

export default function PromptLibraryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [toneFilter, setToneFilter] = useState<"all" | PromptBrief["tone"]>("all");
  const [activePrompt, setActivePrompt] = useState<PromptBrief | null>(null);

  const filteredPrompts = useMemo(
    () => filterPrompts({ query: searchTerm, tone: toneFilter }),
    [searchTerm, toneFilter],
  );

  const handleUsePrompt = (prompt: PromptBrief) => {
    router.push(`/generate?promptId=${prompt.id}`);
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Badge variant="outline" className="w-fit border-primary/40 text-primary">
            Bibliothèque de briefs
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Prompts prêts à l'emploi</h1>
          <p className="text-muted-foreground max-w-2xl">
            Sélectionnez un brief aligné avec les promesses de Postgen AI : cohérence de marque, cadence x4 et workflows simplifiés.
          </p>
        </div>
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un brief par titre, objectif ou instructions..."
                className="pl-9"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2" onClick={() => setToneFilter("all")}>
              <Filter className="h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
          <Tabs
            value={toneFilter}
            onValueChange={(value) => setToneFilter(value as typeof toneFilter)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 gap-2 md:grid-cols-5">
              {toneFilters.map((tone) => (
                <TabsTrigger key={tone.value} value={tone.value} className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{tone.label}</span>
                  <span className="text-xs text-muted-foreground">{tone.description}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      <section>
        {filteredPrompts.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Aucun brief trouvé</CardTitle>
              <CardDescription>
                Ajustez votre recherche ou explorez un autre ton pour découvrir des templates adaptés à vos campagnes.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredPrompts.map((prompt) => (
              <Card key={prompt.id} className="flex h-full flex-col border-border/80">
                <CardHeader className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl font-semibold leading-tight">
                        {prompt.title}
                      </CardTitle>
                      <CardDescription className="mt-2 text-sm">
                        {prompt.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {prompt.tone}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {prompt.instructions}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    variant="outline"
                    className="w-full gap-2 sm:w-auto"
                    onClick={() => setActivePrompt(prompt)}
                  >
                    <Sparkles className="h-4 w-4" />
                    Prévisualiser
                  </Button>
                  <Button className="w-full gap-2 sm:w-auto" onClick={() => handleUsePrompt(prompt)}>
                    <ExternalLink className="h-4 w-4" />
                    Utiliser dans le générateur
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-muted/40 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Besoin d'un template personnalisé ?</h2>
            <p className="text-sm text-muted-foreground">
              Inspirez-vous de ces briefs pour créer les vôtres et gardez une cohérence éditoriale sur l'ensemble de vos campagnes.
            </p>
          </div>
          <Button asChild variant="secondary" className="gap-2">
            <Link href="/generate">
              <Sparkles className="h-4 w-4" />
              Ouvrir le générateur
            </Link>
          </Button>
        </div>
      </section>

      <Dialog open={!!activePrompt} onOpenChange={() => setActivePrompt(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{activePrompt?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {activePrompt?.tone}
              </Badge>
              {activePrompt?.description}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh] pr-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {activePrompt?.instructions}
            </p>
          </ScrollArea>
          {activePrompt && (
            <Button className="mt-4 gap-2" onClick={() => handleUsePrompt(activePrompt)}>
              <ExternalLink className="h-4 w-4" />
              Insérer ce brief dans le générateur
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
