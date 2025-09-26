"use client";

import { useEffect, useMemo, useState } from "react";
import { Lightbulb, Plus, Target, Trash2, Trophy } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardEditableListSection } from "@/components/dashboard/DashboardEditableListSection";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AuthPage from "@/app/auth/page";
import { useToast } from "@/hooks/use-toast";
import type { IdeaBacklogItem } from "@/lib/auth";

const STATUS_OPTIONS: { value: NonNullable<IdeaBacklogItem["status"]>; label: string }[] = [
  { value: "new", label: "À explorer" },
  { value: "in-progress", label: "En cours" },
  { value: "approved", label: "Prêtes" },
  { value: "published", label: "Publiées" },
];

const STATUS_DESCRIPTIONS: Record<NonNullable<IdeaBacklogItem["status"]>, string> = {
  new: "Idées à clarifier et prioriser.",
  "in-progress": "Briefs en cours de structuration.",
  approved: "Validées pour lancement.",
  published: "Déjà publiées ou diffusées.",
};

const IMPACT_LABELS: Record<NonNullable<IdeaBacklogItem["impact"]>, string> = {
  high: "Fort", 
  medium: "Moyen",
  low: "Faible",
};

const EFFORT_LABELS: Record<NonNullable<IdeaBacklogItem["effort"]>, string> = {
  high: "Élevé",
  medium: "Modéré",
  low: "Léger",
};

const IMPACT_SCORES = {
  high: 3,
  medium: 2,
  low: 1,
};

const EFFORT_SCORES = {
  high: 1,
  medium: 2,
  low: 3,
};

const DEFAULT_CHANNELS = [
  "LinkedIn",
  "Newsletter",
  "Blog",
  "YouTube",
  "Podcast",
  "Webinar",
];

interface NewIdeaForm {
  topic: string;
  channel: string;
  objective: string;
  impact: NonNullable<IdeaBacklogItem["impact"]>;
  effort: NonNullable<IdeaBacklogItem["effort"]>;
}

export default function IdeasBacklogPage() {
  const { currentOrganization, updateCurrentOrganization } = useAuth();
  const { toast } = useToast();
  const [ideas, setIdeas] = useState<IdeaBacklogItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [newIdea, setNewIdea] = useState<NewIdeaForm>({
    topic: "",
    channel: "",
    objective: "",
    impact: "medium",
    effort: "medium",
  });

  useEffect(() => {
    if (currentOrganization?.ideaBacklog?.length) {
      setIdeas(currentOrganization.ideaBacklog);
    } else {
      setIdeas([]);
    }
  }, [currentOrganization?.ideaBacklog]);

  const statusCounts = useMemo(() => {
    return STATUS_OPTIONS.reduce<Record<string, number>>((acc, option) => {
      acc[option.value] = ideas.filter((idea) => idea.status === option.value).length;
      return acc;
    }, {});
  }, [ideas]);

  const channelStats = useMemo(() => {
    const stats: Record<string, number> = {};
    ideas.forEach((idea) => {
      const channel = idea.channel?.trim() || "Non défini";
      stats[channel] = (stats[channel] ?? 0) + 1;
    });
    return stats;
  }, [ideas]);

  const prioritizedIdeas = useMemo(() => {
    return [...ideas]
      .filter((idea) => idea.status !== "published")
      .map((idea) => ({
        idea,
        score:
          (IMPACT_SCORES[idea.impact ?? "medium"] ?? 2) +
          (EFFORT_SCORES[idea.effort ?? "medium"] ?? 2),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [ideas]);

  const recommendedChannels = useMemo(() => {
    return Object.entries(channelStats)
      .filter(([channel]) => channel !== "Non défini")
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([channel]) => channel);
  }, [channelStats]);

  const addIdea = () => {
    if (!newIdea.topic.trim()) {
      toast({
        title: "Sujet requis",
        description: "Ajoutez un sujet pour créer une nouvelle idée.",
        variant: "destructive",
      });
      return;
    }

    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}`;

    const idea: IdeaBacklogItem = {
      id,
      topic: newIdea.topic.trim(),
      channel: newIdea.channel.trim() || "À définir",
      objective: newIdea.objective.trim(),
      impact: newIdea.impact,
      effort: newIdea.effort,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    setIdeas((prev) => [idea, ...prev]);
    setNewIdea({ topic: "", channel: "", objective: "", impact: "medium", effort: "medium" });

    toast({
      title: "Idée ajoutée",
      description: "Votre idée a été ajoutée au backlog.",
    });
  };

  const updateIdea = <K extends keyof IdeaBacklogItem>(
    ideaId: string,
    field: K,
    value: IdeaBacklogItem[K],
  ) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === ideaId
          ? {
              ...idea,
              [field]: value,
            }
          : idea,
      ),
    );
  };

  const removeIdea = (ideaId: string) => {
    setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));
  };

  const handleSave = async () => {
    if (!currentOrganization) return;

    setSaving(true);
    try {
      await updateCurrentOrganization({ ideaBacklog: ideas });
      toast({
        title: "Backlog mis à jour",
        description: "Toutes les idées ont été enregistrées.",
      });
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du backlog", err);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le backlog pour le moment.",
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
              <CardTitle>Backlog d'idées</CardTitle>
              <CardDescription>
                Sélectionnez une organisation pour gérer vos idées.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Backlog d'idées</h1>
          <p className="text-sm text-muted-foreground">
            Capturez, priorisez et pilotez les idées de campagnes à lancer.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            title="Total d'idées"
            value={ideas.length}
            subtitle={ideas.length ? "Idées enregistrées" : "Ajoutez votre première idée"}
            icon={Lightbulb}
          />
          <DashboardStatCard
            title="Idées en cours"
            value={statusCounts["in-progress"] ?? 0}
            subtitle="Suivi opérationnel"
            icon={Target}
          />
          <DashboardStatCard
            title="Idées prêtes"
            value={statusCounts["approved"] ?? 0}
            subtitle="Prêtes à passer en production"
            icon={Trophy}
          />
          <DashboardStatCard title="Canaux clés">
            {recommendedChannels.length ? (
              <div className="flex flex-wrap gap-2">
                {recommendedChannels.map((channel) => (
                  <Badge key={channel} variant="secondary">
                    {channel}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Aucun canal dominant identifié pour le moment.
              </p>
            )}
          </DashboardStatCard>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter une idée</CardTitle>
          <CardDescription>
            Enrichissez rapidement votre pipeline de campagnes et contenus.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="idea-topic">Sujet</Label>
              <Input
                id="idea-topic"
                value={newIdea.topic}
                placeholder="Ex: Série de posts LinkedIn sur notre lancement"
                onChange={(event) => setNewIdea((prev) => ({ ...prev, topic: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idea-channel">Canal principal</Label>
              <Input
                id="idea-channel"
                value={newIdea.channel}
                placeholder="LinkedIn, Newsletter, Webinaire..."
                onChange={(event) => setNewIdea((prev) => ({ ...prev, channel: event.target.value }))}
                list="idea-channel-suggestions"
              />
              <datalist id="idea-channel-suggestions">
                {[...new Set([...DEFAULT_CHANNELS, ...Object.keys(channelStats)])].map((channel) => (
                  <option key={channel} value={channel} />
                ))}
              </datalist>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="idea-objective">Objectif</Label>
            <Textarea
              id="idea-objective"
              value={newIdea.objective}
              rows={3}
              placeholder="Quel impact marketing recherchez-vous ?"
              onChange={(event) =>
                setNewIdea((prev) => ({ ...prev, objective: event.target.value }))
              }
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Impact attendu</Label>
              <Select
                value={newIdea.impact}
                onValueChange={(value: NonNullable<IdeaBacklogItem["impact"]>) =>
                  setNewIdea((prev) => ({ ...prev, impact: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Impact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{IMPACT_LABELS.high}</SelectItem>
                  <SelectItem value="medium">{IMPACT_LABELS.medium}</SelectItem>
                  <SelectItem value="low">{IMPACT_LABELS.low}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Effort requis</Label>
              <Select
                value={newIdea.effort}
                onValueChange={(value: NonNullable<IdeaBacklogItem["effort"]>) =>
                  setNewIdea((prev) => ({ ...prev, effort: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Effort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{EFFORT_LABELS.low}</SelectItem>
                  <SelectItem value="medium">{EFFORT_LABELS.medium}</SelectItem>
                  <SelectItem value="high">{EFFORT_LABELS.high}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={addIdea} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Ajouter au backlog
          </Button>
        </CardContent>
      </Card>

        <div className="grid gap-6 lg:grid-cols-4">
          {STATUS_OPTIONS.map((statusOption) => {
            const items = ideas.filter((idea) => idea.status === statusOption.value);
            return (
              <DashboardEditableListSection
                key={statusOption.value}
                title={statusOption.label}
                description={STATUS_DESCRIPTIONS[statusOption.value]}
                items={items}
                getItemKey={(idea) => idea.id}
                itemClassName="space-y-3"
                emptyState={
                  <p className="text-sm text-muted-foreground">
                    Aucune idée dans cette étape pour le moment.
                  </p>
                }
                renderItem={(idea) => (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Input
                        value={idea.topic}
                        onChange={(event) => updateIdea(idea.id, "topic", event.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeIdea(idea.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>
                          Créée le {new Date(idea.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                        {idea.objective ? (
                          <Badge variant="secondary">Objectif défini</Badge>
                        ) : null}
                      </div>
                      <Label className="text-xs text-muted-foreground">Canal</Label>
                      <Input
                        value={idea.channel ?? ""}
                        onChange={(event) => updateIdea(idea.id, "channel", event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Objectif</Label>
                      <Textarea
                        value={idea.objective ?? ""}
                        rows={3}
                        placeholder="Décrire l'angle ou le résultat attendu"
                        onChange={(event) => updateIdea(idea.id, "objective", event.target.value)}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Impact</Label>
                        <Select
                          value={idea.impact ?? "medium"}
                          onValueChange={(value: NonNullable<IdeaBacklogItem["impact"]>) =>
                            updateIdea(idea.id, "impact", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">{IMPACT_LABELS.high}</SelectItem>
                            <SelectItem value="medium">{IMPACT_LABELS.medium}</SelectItem>
                            <SelectItem value="low">{IMPACT_LABELS.low}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Effort</Label>
                        <Select
                          value={idea.effort ?? "medium"}
                          onValueChange={(value: NonNullable<IdeaBacklogItem["effort"]>) =>
                            updateIdea(idea.id, "effort", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">{EFFORT_LABELS.low}</SelectItem>
                            <SelectItem value="medium">{EFFORT_LABELS.medium}</SelectItem>
                            <SelectItem value="high">{EFFORT_LABELS.high}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Statut</Label>
                      <Select
                        value={idea.status ?? "new"}
                        onValueChange={(value: NonNullable<IdeaBacklogItem["status"]>) =>
                          updateIdea(idea.id, "status", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              />
            );
          })}
        </div>

      {prioritizedIdeas.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Opportunités à prioriser</CardTitle>
            <CardDescription>
              Sélection basée sur l'impact estimé et l'effort requis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {prioritizedIdeas.map(({ idea, score }) => (
              <div
                key={idea.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{idea.topic}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>Canal : {idea.channel}</span>
                    <span>Impact : {IMPACT_LABELS[idea.impact ?? "medium"]}</span>
                    <span>Effort : {EFFORT_LABELS[idea.effort ?? "medium"]}</span>
                  </div>
                </div>
                <Badge variant="secondary">Score {score}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
