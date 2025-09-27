"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Palette,
  Sparkles,
  PenSquare,
  FolderCog,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardEditableListSection } from "@/components/dashboard/DashboardEditableListSection";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AuthPage from "@/app/auth/page";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import type { BrandGuideline, BrandGuidelineCategory } from "@/lib/auth";

const CATEGORY_OPTIONS: { value: BrandGuidelineCategory; label: string }[] = [
  { value: "voice", label: "Voix & ton" },
  { value: "visual", label: "Identité visuelle" },
  { value: "messaging", label: "Messages clés" },
  { value: "campaign", label: "Campagnes" },
  { value: "compliance", label: "Conformité" },
  { value: "other", label: "Autres" },
];

const CATEGORY_DESCRIPTIONS: Record<BrandGuidelineCategory, string> = {
  voice: "Définissez le ton, le vocabulaire et la posture de marque.",
  visual: "Précisez les usages couleurs, logos et compositions.",
  messaging: "Clarifiez les piliers et arguments clés.",
  campaign: "Documentez les déclinaisons par campagne ou lancement.",
  compliance: "Mentionnez obligations légales ou mentions obligatoires.",
  other: "Capturez tout autre élément utile au marketing.",
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

interface NewGuidelineForm {
  title: string;
  category: BrandGuidelineCategory;
  description: string;
  owner: string;
  toneKeywords: string;
  assets: string;
}

function parseList(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function BrandGuidelinesPage() {
  const { currentOrganization, updateCurrentOrganization } = useAuth();
  const { toast } = useToast();
  const brandGate = useFeatureGate("brand");
  const [guidelines, setGuidelines] = useState<BrandGuideline[]>([]);
  const [saving, setSaving] = useState(false);
  const [newGuideline, setNewGuideline] = useState<NewGuidelineForm>({
    title: "",
    category: "voice",
    description: "",
    owner: "",
    toneKeywords: "",
    assets: "",
  });

  useEffect(() => {
    if (currentOrganization?.brandGuidelines?.length) {
      setGuidelines(currentOrganization.brandGuidelines);
    } else {
      setGuidelines([]);
    }
  }, [currentOrganization?.brandGuidelines]);

  const categoryCounts = useMemo(() => {
    return CATEGORY_OPTIONS.reduce<Record<BrandGuidelineCategory, number>>((acc, option) => {
      acc[option.value] = guidelines.filter((item) => item.category === option.value).length;
      return acc;
    }, {
      voice: 0,
      visual: 0,
      messaging: 0,
      campaign: 0,
      compliance: 0,
      other: 0,
    });
  }, [guidelines]);

  const lastUpdated = useMemo(() => {
    if (!guidelines.length) return null;
    return guidelines
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
  }, [guidelines]);

  const toneKeywords = useMemo(() => {
    const keywords = guidelines.flatMap((item) => item.toneKeywords ?? []);
    return Array.from(new Set(keywords)).slice(0, 6);
  }, [guidelines]);

  const assetCount = useMemo(() => {
    return guidelines.reduce((total, item) => total + (item.assets?.length ?? 0), 0);
  }, [guidelines]);

  const addGuideline = () => {
    if (!newGuideline.title.trim()) {
      toast({
        title: "Titre requis",
        description: "Ajoutez un titre pour créer une directive.",
        variant: "destructive",
      });
      return;
    }

    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}`;

    const guideline: BrandGuideline = {
      id,
      title: newGuideline.title.trim(),
      category: newGuideline.category,
      description: newGuideline.description.trim(),
      owner: newGuideline.owner.trim() || undefined,
      toneKeywords: parseList(newGuideline.toneKeywords),
      assets: parseList(newGuideline.assets),
      updatedAt: new Date().toISOString(),
    };

    setGuidelines((prev) => [guideline, ...prev]);
    setNewGuideline({
      title: "",
      category: newGuideline.category,
      description: "",
      owner: "",
      toneKeywords: "",
      assets: "",
    });

    toast({
      title: "Directive ajoutée",
      description: "Votre charte a été enrichie.",
    });
  };

  const updateGuideline = <K extends keyof BrandGuideline>(
    guidelineId: string,
    field: K,
    value: BrandGuideline[K],
  ) => {
    setGuidelines((prev) =>
      prev.map((item) =>
        item.id === guidelineId
          ? {
              ...item,
              [field]: value,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
  };

  const removeGuideline = (guidelineId: string) => {
    setGuidelines((prev) => prev.filter((item) => item.id !== guidelineId));
  };

  const handleSave = async () => {
    if (!currentOrganization) return;

    setSaving(true);
    try {
      await updateCurrentOrganization({ brandGuidelines: guidelines });
      toast({
        title: "Charte sauvegardée",
        description: "Vos directives de marque ont été mises à jour.",
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des directives", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la charte pour le moment.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!currentOrganization) {
    return (
      <AuthGuard fallback={<AuthPage />}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Charte de marque</CardTitle>
              <CardDescription>
                Sélectionnez une organisation pour accéder aux directives de marque.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  if (brandGate.loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="flex items-center gap-2 rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Vérification des prérequis…</span>
        </div>
      </div>
    );
  }

  if (brandGate.error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Impossible de charger les directives</CardTitle>
            <CardDescription>{brandGate.error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!brandGate.hasAccess) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Disponible avec votre plan</CardTitle>
            <CardDescription>
              {brandGate.requiredPlanLabel
                ? `Passez au plan ${brandGate.requiredPlanLabel} pour activer les directives de marque.`
                : "Mettez à niveau votre offre pour activer les directives de marque."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/dashboard/settings/organization">Mettre à niveau</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Charte de marque</h1>
          <p className="text-sm text-muted-foreground">
            Harmonisez vos contenus avec une base documentaire claire et actionnable.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Total directives"
          value={guidelines.length}
          subtitle={guidelines.length ? "Éléments prêts à l'usage" : "Ajoutez votre première directive"}
          icon={Palette}
        />
        <DashboardStatCard
          title="Voix de marque"
          value={categoryCounts.voice}
          subtitle="Garde-fous rédactionnels"
          icon={Sparkles}
        />
        <DashboardStatCard
          title="Identité visuelle"
          value={categoryCounts.visual}
          subtitle="Logos, palettes, compositions"
          icon={PenSquare}
        />
        <DashboardStatCard
          title="Dernière mise à jour"
          value={lastUpdated ? dateFormatter.format(new Date(lastUpdated.updatedAt)) : "-"}
          subtitle={lastUpdated ? lastUpdated.title : "Aucune directive pour le moment"}
          icon={FolderCog}
        >
          {toneKeywords.length ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {toneKeywords.map((keyword) => (
                <Badge key={keyword} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          ) : null}
          {assetCount ? (
            <p className="text-xs text-muted-foreground pt-2">
              {assetCount} ressource{assetCount > 1 ? "s" : ""} référencée{assetCount > 1 ? "s" : ""}.
            </p>
          ) : null}
        </DashboardStatCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter une directive</CardTitle>
          <CardDescription>
            Décrivez les éléments essentiels pour guider vos équipes créatives.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="guideline-title">Titre</Label>
              <Input
                id="guideline-title"
                value={newGuideline.title}
                placeholder="Ex : Ton LinkedIn, Palette de couleurs"
                onChange={(event) => setNewGuideline((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={newGuideline.category}
                onValueChange={(value: BrandGuidelineCategory) =>
                  setNewGuideline((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={newGuideline.description}
              rows={4}
              placeholder="Décrivez les règles, exclusions et exemples concrets"
              onChange={(event) => setNewGuideline((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Référent</Label>
              <Input
                value={newGuideline.owner}
                placeholder="Nom du responsable"
                onChange={(event) => setNewGuideline((prev) => ({ ...prev, owner: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Mots-clés de ton</Label>
              <Textarea
                value={newGuideline.toneKeywords}
                rows={3}
                placeholder="Séparez par virgule ou retour à la ligne"
                onChange={(event) =>
                  setNewGuideline((prev) => ({ ...prev, toneKeywords: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Ressources / assets</Label>
            <Textarea
              value={newGuideline.assets}
              rows={3}
              placeholder="Liens Figma, dossiers Drive, templates..."
              onChange={(event) => setNewGuideline((prev) => ({ ...prev, assets: event.target.value }))}
            />
          </div>
          <Button onClick={addGuideline} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Ajouter à la charte
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        {CATEGORY_OPTIONS.map((category) => {
          const items = guidelines.filter((item) => item.category === category.value);
          return (
            <DashboardEditableListSection
              key={category.value}
              title={category.label}
              description={CATEGORY_DESCRIPTIONS[category.value]}
              items={items}
              getItemKey={(item) => item.id}
              itemClassName="space-y-3"
              emptyState={
                <p className="text-sm text-muted-foreground">
                  Aucune directive enregistrée pour cette catégorie.
                </p>
              }
              renderItem={(item) => (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Input
                      value={item.title}
                      onChange={(event) => updateGuideline(item.id, "title", event.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeGuideline(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <Textarea
                      value={item.description}
                      rows={4}
                      placeholder="Règles, nuances, exemples"
                      onChange={(event) => updateGuideline(item.id, "description", event.target.value)}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Référent</Label>
                      <Input
                        value={item.owner ?? ""}
                        onChange={(event) => updateGuideline(item.id, "owner", event.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Catégorie</Label>
                      <Select
                        value={item.category}
                        onValueChange={(value: BrandGuidelineCategory) =>
                          updateGuideline(item.id, "category", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Mots-clés</Label>
                    <Textarea
                      value={(item.toneKeywords ?? []).join("\n")}
                      rows={3}
                      placeholder="Séparez par ligne"
                      onChange={(event) =>
                        updateGuideline(item.id, "toneKeywords", parseList(event.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Ressources</Label>
                    <Textarea
                      value={(item.assets ?? []).join("\n")}
                      rows={3}
                      placeholder="Liens et documents utiles"
                      onChange={(event) =>
                        updateGuideline(item.id, "assets", parseList(event.target.value))
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dernière mise à jour : {dateFormatter.format(new Date(item.updatedAt))}
                  </p>
                </div>
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
