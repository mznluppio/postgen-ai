"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Users, Target, BarChart3, MessageCircle, Trash2, Plus, Loader2 } from "lucide-react";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardEditableListSection } from "@/components/dashboard/DashboardEditableListSection";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AuthPage from "@/app/auth/page";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import type { AudiencePersona } from "@/lib/auth";

const STAGE_OPTIONS: { value: NonNullable<AudiencePersona["stage"]>; label: string }[] = [
  { value: "awareness", label: "Découverte" },
  { value: "consideration", label: "Évaluation" },
  { value: "decision", label: "Décision" },
  { value: "retention", label: "Fidélisation" },
];

const STAGE_DESCRIPTIONS: Record<NonNullable<AudiencePersona["stage"]>, string> = {
  awareness: "Personas qui découvrent votre offre.",
  consideration: "Comparaison active de solutions.",
  decision: "Prêts à s'engager, requièrent la preuve finale.",
  retention: "Clients existants à fidéliser ou upseller.",
};

function parseList(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

interface NewPersonaForm {
  name: string;
  segment: string;
  stage: NonNullable<AudiencePersona["stage"]>;
  description: string;
  pains: string;
  goals: string;
  channels: string;
  notes: string;
}

export default function AudiencePersonasPage() {
  const { currentOrganization, updateCurrentOrganization } = useAuth();
  const { toast } = useToast();
  const audienceGate = useFeatureGate("audiences");
  const [personas, setPersonas] = useState<AudiencePersona[]>([]);
  const [saving, setSaving] = useState(false);
  const [newPersona, setNewPersona] = useState<NewPersonaForm>({
    name: "",
    segment: "",
    stage: "awareness",
    description: "",
    pains: "",
    goals: "",
    channels: "",
    notes: "",
  });

  useEffect(() => {
    if (currentOrganization?.audiencePersonas?.length) {
      setPersonas(currentOrganization.audiencePersonas);
    } else {
      setPersonas([]);
    }
  }, [currentOrganization?.audiencePersonas]);

  const stageCounts = useMemo(() => {
    return STAGE_OPTIONS.reduce<Record<NonNullable<AudiencePersona["stage"]>, number>>((acc, option) => {
      acc[option.value] = personas.filter((persona) => persona.stage === option.value).length;
      return acc;
    }, {
      awareness: 0,
      consideration: 0,
      decision: 0,
      retention: 0,
    });
  }, [personas]);

  const strategicSegments = useMemo(() => {
    return Array.from(new Set(personas.map((persona) => persona.segment).filter(Boolean))).slice(0, 4);
  }, [personas]);

  const primaryChannels = useMemo(() => {
    return Array.from(
      new Set(
        personas
          .flatMap((persona) => persona.preferredChannels ?? [])
          .map((channel) => channel.trim())
          .filter(Boolean),
      ),
    ).slice(0, 6);
  }, [personas]);

  const addPersona = () => {
    if (!newPersona.name.trim()) {
      toast({
        title: "Nom requis",
        description: "Ajoutez un nom pour créer un persona.",
        variant: "destructive",
      });
      return;
    }

    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}`;

    const persona: AudiencePersona = {
      id,
      name: newPersona.name.trim(),
      segment: newPersona.segment.trim() || undefined,
      stage: newPersona.stage,
      description: newPersona.description.trim() || undefined,
      pains: parseList(newPersona.pains),
      goals: parseList(newPersona.goals),
      preferredChannels: parseList(newPersona.channels),
      notes: newPersona.notes.trim() || undefined,
    };

    setPersonas((prev) => [persona, ...prev]);
    setNewPersona({
      name: "",
      segment: "",
      stage: "awareness",
      description: "",
      pains: "",
      goals: "",
      channels: "",
      notes: "",
    });

    toast({
      title: "Persona ajouté",
      description: "La segmentation a été enrichie.",
    });
  };

  const updatePersona = <K extends keyof AudiencePersona>(
    personaId: string,
    field: K,
    value: AudiencePersona[K],
  ) => {
    setPersonas((prev) =>
      prev.map((persona) => (persona.id === personaId ? { ...persona, [field]: value } : persona)),
    );
  };

  const removePersona = (personaId: string) => {
    setPersonas((prev) => prev.filter((persona) => persona.id !== personaId));
  };

  const handleSave = async () => {
    if (!currentOrganization) return;

    setSaving(true);
    try {
      await updateCurrentOrganization({ audiencePersonas: personas });
      toast({
        title: "Personas sauvegardés",
        description: "Vos profils cibles ont été mis à jour.",
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des personas", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les personas pour le moment.",
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
              <CardTitle>Personas cibles</CardTitle>
              <CardDescription>
                Sélectionnez une organisation pour accéder aux personas marketing.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  if (audienceGate.loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="flex items-center gap-2 rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Vérification des prérequis…</span>
        </div>
      </div>
    );
  }

  if (audienceGate.error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Impossible de charger l'outil</CardTitle>
            <CardDescription>{audienceGate.error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!audienceGate.hasPlanAccess) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Réservé aux plans supérieurs</CardTitle>
            <CardDescription>
              {audienceGate.requiredPlanLabel
                ? `Passez au plan ${audienceGate.requiredPlanLabel} pour activer la cartographie des audiences.`
                : "Mettez à niveau votre offre pour activer la cartographie des audiences."}
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
          <h1 className="text-2xl font-bold">Personas cibles</h1>
          <p className="text-sm text-muted-foreground">
            Documentez les besoins, freins et canaux prioritaires de vos audiences.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Total personas"
          value={personas.length}
          subtitle={personas.length ? "Profils disponibles" : "Ajoutez votre premier persona"}
          icon={Users}
        />
        <DashboardStatCard
          title="Stade dominant"
          value={(() => {
            const sortedStages = [...STAGE_OPTIONS].sort(
              (a, b) => (stageCounts[b.value] ?? 0) - (stageCounts[a.value] ?? 0),
            );
            const topStage = sortedStages[0];
            return topStage ? topStage.label : "-";
          })()}
          subtitle="Distribution entonnoir"
          icon={BarChart3}
        />
        <DashboardStatCard
          title="Segments clés"
          value={strategicSegments.length}
          subtitle="Segments activés"
          icon={Target}
        >
          {strategicSegments.length ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {strategicSegments.map((segment) => (
                <Badge key={segment} variant="secondary">
                  {segment}
                </Badge>
              ))}
            </div>
          ) : null}
        </DashboardStatCard>
        <DashboardStatCard title="Canaux prioritaires" icon={MessageCircle}>
          {primaryChannels.length ? (
            <div className="flex flex-wrap gap-2">
              {primaryChannels.map((channel) => (
                <Badge key={channel} variant="secondary">
                  {channel}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Aucun canal renseigné pour le moment.
            </p>
          )}
        </DashboardStatCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter un persona</CardTitle>
          <CardDescription>
            Capturez les informations indispensables pour personnaliser vos campagnes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="persona-name">Nom</Label>
              <Input
                id="persona-name"
                value={newPersona.name}
                placeholder="Ex : Marie, Directrice Marketing"
                onChange={(event) => setNewPersona((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="persona-segment">Segment / Industrie</Label>
              <Input
                id="persona-segment"
                value={newPersona.segment}
                placeholder="SaaS B2B, Retail, Scale-up..."
                onChange={(event) => setNewPersona((prev) => ({ ...prev, segment: event.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Stade dans le parcours</Label>
            <Select
              value={newPersona.stage}
              onValueChange={(value: NonNullable<AudiencePersona["stage"]>) =>
                setNewPersona((prev) => ({ ...prev, stage: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Résumé</Label>
            <Textarea
              value={newPersona.description}
              rows={3}
              placeholder="Contexte, responsabilités, objectifs prioritaires"
              onChange={(event) => setNewPersona((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Freins / douleurs</Label>
              <Textarea
                value={newPersona.pains}
                rows={3}
                placeholder="Séparez par ligne"
                onChange={(event) => setNewPersona((prev) => ({ ...prev, pains: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Objectifs</Label>
              <Textarea
                value={newPersona.goals}
                rows={3}
                placeholder="Séparez par ligne"
                onChange={(event) => setNewPersona((prev) => ({ ...prev, goals: event.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Canaux privilégiés</Label>
            <Textarea
              value={newPersona.channels}
              rows={3}
              placeholder="LinkedIn, Événements, Podcast..."
              onChange={(event) => setNewPersona((prev) => ({ ...prev, channels: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={newPersona.notes}
              rows={3}
              placeholder="Triggers, contenus favoris, call-to-action efficaces"
              onChange={(event) => setNewPersona((prev) => ({ ...prev, notes: event.target.value }))}
            />
          </div>
          <Button onClick={addPersona} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Ajouter le persona
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-4">
        {STAGE_OPTIONS.map((stage) => {
          const items = personas.filter((persona) => persona.stage === stage.value);
          return (
            <DashboardEditableListSection
              key={stage.value}
              title={stage.label}
              description={STAGE_DESCRIPTIONS[stage.value]}
              items={items}
              getItemKey={(persona) => persona.id}
              itemClassName="space-y-3"
              emptyState={
                <p className="text-sm text-muted-foreground">
                  Aucun persona dans ce stade pour le moment.
                </p>
              }
              renderItem={(persona) => (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Input
                      value={persona.name}
                      onChange={(event) => updatePersona(persona.id, "name", event.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removePersona(persona.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Segment</Label>
                      <Input
                        value={persona.segment ?? ""}
                        onChange={(event) => updatePersona(persona.id, "segment", event.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Stade</Label>
                      <Select
                        value={persona.stage ?? "awareness"}
                        onValueChange={(value: NonNullable<AudiencePersona["stage"]>) =>
                          updatePersona(persona.id, "stage", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STAGE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Résumé</Label>
                    <Textarea
                      value={persona.description ?? ""}
                      rows={3}
                      placeholder="Situation, enjeux, besoins"
                      onChange={(event) => updatePersona(persona.id, "description", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Freins / douleurs</Label>
                    <Textarea
                      value={(persona.pains ?? []).join("\n")}
                      rows={3}
                      placeholder="Listez un point par ligne"
                      onChange={(event) => updatePersona(persona.id, "pains", parseList(event.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Objectifs</Label>
                    <Textarea
                      value={(persona.goals ?? []).join("\n")}
                      rows={3}
                      placeholder="Listez un objectif par ligne"
                      onChange={(event) => updatePersona(persona.id, "goals", parseList(event.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Canaux préférés</Label>
                    <Textarea
                      value={(persona.preferredChannels ?? []).join("\n")}
                      rows={3}
                      placeholder="LinkedIn, Email, Podcast..."
                      onChange={(event) =>
                        updatePersona(persona.id, "preferredChannels", parseList(event.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Notes</Label>
                    <Textarea
                      value={persona.notes ?? ""}
                      rows={3}
                      placeholder="Astuce conversion, objections, partenariats"
                      onChange={(event) => updatePersona(persona.id, "notes", event.target.value)}
                    />
                  </div>
                </div>
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
