"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle,
  Clock3,
  Megaphone,
  Trash2,
  Plus,
} from "lucide-react";

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
import type { EditorialCalendarEntry, EditorialCalendarStatus } from "@/lib/auth";

const STATUS_OPTIONS: { value: EditorialCalendarStatus; label: string }[] = [
  { value: "draft", label: "À planifier" },
  { value: "in-production", label: "En production" },
  { value: "scheduled", label: "Programmés" },
  { value: "published", label: "Publiés" },
];

const STATUS_DESCRIPTIONS: Record<EditorialCalendarStatus, string> = {
  draft: "Briefs à enrichir ou dates à fixer.",
  "in-production": "Contenus en cours de création.",
  scheduled: "Contenus prêts et planifiés.",
  published: "Contenus déjà diffusés.",
};

const CONTENT_TYPES = [
  "Post social",
  "Newsletter",
  "Article de blog",
  "Vidéo",
  "Webinaire",
  "Podcast",
];

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

interface NewEntryForm {
  title: string;
  channel: string;
  contentType: string;
  publishDate: string;
  owner: string;
  status: EditorialCalendarStatus;
  objective: string;
  notes: string;
}

export default function EditorialCalendarPage() {
  const { currentOrganization, updateCurrentOrganization } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<EditorialCalendarEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [newEntry, setNewEntry] = useState<NewEntryForm>({
    title: "",
    channel: "",
    contentType: CONTENT_TYPES[0],
    publishDate: "",
    owner: "",
    status: "draft",
    objective: "",
    notes: "",
  });

  useEffect(() => {
    if (currentOrganization?.editorialCalendar?.length) {
      setEntries(currentOrganization.editorialCalendar);
    } else {
      setEntries([]);
    }
  }, [currentOrganization?.editorialCalendar]);

  const statusCounts = useMemo(() => {
    return STATUS_OPTIONS.reduce<Record<EditorialCalendarStatus, number>>((acc, option) => {
      acc[option.value] = entries.filter((entry) => entry.status === option.value).length;
      return acc;
    }, {
      draft: 0,
      "in-production": 0,
      scheduled: 0,
      published: 0,
    });
  }, [entries]);

  const activeChannels = useMemo(() => {
    return Array.from(
      new Set(entries.map((entry) => entry.channel.trim()).filter((channel) => channel)),
    ).slice(0, 6);
  }, [entries]);

  const nextScheduled = useMemo(() => {
    const futureEntries = entries
      .filter((entry) => entry.publishDate && new Date(entry.publishDate) >= new Date())
      .sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime());
    return futureEntries[0];
  }, [entries]);

  const publishedThisMonth = useMemo(() => {
    const now = new Date();
    return entries.filter((entry) => {
      if (!entry.publishDate) return false;
      const date = new Date(entry.publishDate);
      return (
        entry.status === "published" &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [entries]);

  const addEntry = () => {
    if (!newEntry.title.trim()) {
      toast({
        title: "Titre requis",
        description: "Ajoutez un titre pour planifier le contenu.",
        variant: "destructive",
      });
      return;
    }

    if (!newEntry.publishDate) {
      toast({
        title: "Date de publication requise",
        description: "Sélectionnez une date pour ce contenu.",
        variant: "destructive",
      });
      return;
    }

    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}`;

    const entry: EditorialCalendarEntry = {
      id,
      title: newEntry.title.trim(),
      channel: newEntry.channel.trim() || "À définir",
      contentType: newEntry.contentType,
      owner: newEntry.owner.trim() || undefined,
      status: newEntry.status,
      publishDate: newEntry.publishDate,
      objective: newEntry.objective.trim() || undefined,
      notes: newEntry.notes.trim() || undefined,
      assets: [],
    };

    setEntries((prev) => [entry, ...prev]);
    setNewEntry({
      title: "",
      channel: "",
      contentType: CONTENT_TYPES[0],
      publishDate: "",
      owner: "",
      status: "draft",
      objective: "",
      notes: "",
    });

    toast({
      title: "Contenu ajouté",
      description: "Le planning éditorial a été mis à jour.",
    });
  };

  const updateEntry = <K extends keyof EditorialCalendarEntry>(
    entryId: string,
    field: K,
    value: EditorialCalendarEntry[K],
  ) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === entryId ? { ...entry, [field]: value } : entry)),
    );
  };

  const removeEntry = (entryId: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
  };

  const handleSave = async () => {
    if (!currentOrganization) return;

    setSaving(true);
    try {
      await updateCurrentOrganization({ editorialCalendar: entries });
      toast({
        title: "Planning sauvegardé",
        description: "Toutes les modifications ont été enregistrées.",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du planning", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le planning pour le moment.",
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
              <CardTitle>Planning éditorial</CardTitle>
              <CardDescription>
                Sélectionnez une organisation pour gérer votre calendrier de contenus.
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
          <h1 className="text-2xl font-bold">Planning éditorial</h1>
          <p className="text-sm text-muted-foreground">
            Pilotez vos publications à venir et assurez une présence régulière.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Total planifié"
          value={entries.length}
          subtitle={entries.length ? "Contenus suivis" : "Ajoutez votre premier contenu"}
          icon={CalendarDays}
        />
        <DashboardStatCard
          title="Programmés"
          value={statusCounts["scheduled"] ?? 0}
          subtitle="Prêts à être publiés"
          icon={Clock3}
        />
        <DashboardStatCard
          title="Publiés ce mois"
          value={publishedThisMonth}
          subtitle="Suivi de la performance"
          icon={CheckCircle}
        />
        <DashboardStatCard
          title="Prochain contenu"
          value={nextScheduled ? dateFormatter.format(new Date(nextScheduled.publishDate)) : "-"}
          subtitle={nextScheduled ? nextScheduled.title : "Aucune publication planifiée"}
          icon={Megaphone}
        >
          {activeChannels.length ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {activeChannels.map((channel) => (
                <Badge key={channel} variant="secondary">
                  {channel}
                </Badge>
              ))}
            </div>
          ) : null}
        </DashboardStatCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter un contenu</CardTitle>
          <CardDescription>
            Centralisez les informations nécessaires pour briefer vos équipes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="calendar-title">Titre</Label>
              <Input
                id="calendar-title"
                value={newEntry.title}
                placeholder="Ex : Lancement produit - vidéo YouTube"
                onChange={(event) => setNewEntry((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendar-channel">Canal principal</Label>
              <Input
                id="calendar-channel"
                value={newEntry.channel}
                placeholder="LinkedIn, Blog, Email..."
                onChange={(event) => setNewEntry((prev) => ({ ...prev, channel: event.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Type de contenu</Label>
              <Select
                value={newEntry.contentType}
                onValueChange={(value) => setNewEntry((prev) => ({ ...prev, contentType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date de publication</Label>
              <Input
                type="date"
                value={newEntry.publishDate}
                onChange={(event) =>
                  setNewEntry((prev) => ({ ...prev, publishDate: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Responsable</Label>
              <Input
                value={newEntry.owner}
                placeholder="Nom du référent"
                onChange={(event) => setNewEntry((prev) => ({ ...prev, owner: event.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Objectif</Label>
              <Textarea
                value={newEntry.objective}
                rows={3}
                placeholder="Décrivez l'objectif marketing recherché"
                onChange={(event) => setNewEntry((prev) => ({ ...prev, objective: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes internes</Label>
              <Textarea
                value={newEntry.notes}
                rows={3}
                placeholder="Contraintes, CTA, assets à prévoir..."
                onChange={(event) => setNewEntry((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Statut</Label>
            <Select
              value={newEntry.status}
              onValueChange={(value: EditorialCalendarStatus) =>
                setNewEntry((prev) => ({ ...prev, status: value }))
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
          <Button onClick={addEntry} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Ajouter au planning
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-4">
        {STATUS_OPTIONS.map((statusOption) => {
          const items = entries.filter((entry) => entry.status === statusOption.value);
          return (
            <DashboardEditableListSection
              key={statusOption.value}
              title={statusOption.label}
              description={STATUS_DESCRIPTIONS[statusOption.value]}
              items={items}
              getItemKey={(entry) => entry.id}
              itemClassName="space-y-3"
              emptyState={
                <p className="text-sm text-muted-foreground">
                  Aucun contenu dans cette étape pour le moment.
                </p>
              }
              renderItem={(entry) => (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <Input
                        value={entry.title}
                        onChange={(event) => updateEntry(entry.id, "title", event.target.value)}
                      />
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>{entry.contentType}</span>
                        {entry.channel ? <Badge variant="outline">{entry.channel}</Badge> : null}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Date</Label>
                      <Input
                        type="date"
                        value={entry.publishDate ?? ""}
                        onChange={(event) => updateEntry(entry.id, "publishDate", event.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Responsable</Label>
                      <Input
                        value={entry.owner ?? ""}
                        onChange={(event) => updateEntry(entry.id, "owner", event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Objectif</Label>
                    <Textarea
                      value={entry.objective ?? ""}
                      rows={3}
                      placeholder="Angle, KPI ou offre mise en avant"
                      onChange={(event) => updateEntry(entry.id, "objective", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Notes internes</Label>
                    <Textarea
                      value={entry.notes ?? ""}
                      rows={3}
                      placeholder="Brief créatif, ressources, messages clés"
                      onChange={(event) => updateEntry(entry.id, "notes", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Statut</Label>
                    <Select
                      value={entry.status}
                      onValueChange={(value: EditorialCalendarStatus) =>
                        updateEntry(entry.id, "status", value)
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
    </div>
  );
}
