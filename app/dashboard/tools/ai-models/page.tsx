"use client";

import { useEffect, useMemo, useState } from "react";
import { Cpu, Activity, Workflow, RefreshCw, Trash2, Plus } from "lucide-react";

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
import type { AIModelConfig } from "@/lib/auth";

const PROVIDER_OPTIONS = ["OpenAI", "Anthropic", "Mistral", "Cohere", "Custom"] as const;
const STATUS_OPTIONS: { value: AIModelConfig["status"]; label: string }[] = [
  { value: "active", label: "Actif" },
  { value: "paused", label: "En pause" },
];

const STATUS_DESCRIPTIONS: Record<AIModelConfig["status"], string> = {
  active: "Modèles prêts à générer du contenu.",
  paused: "Configurations désactivées ou en attente.",
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

interface NewModelForm {
  name: string;
  provider: (typeof PROVIDER_OPTIONS)[number];
  useCase: string;
  status: AIModelConfig["status"];
  temperature: number;
  maxTokens: number;
  instructions: string;
  lastTrainedAt: string;
}

export default function AIModelsPage() {
  const { currentOrganization, updateCurrentOrganization } = useAuth();
  const { toast } = useToast();
  const [models, setModels] = useState<AIModelConfig[]>([]);
  const [saving, setSaving] = useState(false);
  const [newModel, setNewModel] = useState<NewModelForm>({
    name: "",
    provider: "OpenAI",
    useCase: "",
    status: "active",
    temperature: 0.7,
    maxTokens: 800,
    instructions: "",
    lastTrainedAt: "",
  });

  useEffect(() => {
    if (currentOrganization?.aiModelConfigs?.length) {
      setModels(currentOrganization.aiModelConfigs);
    } else {
      setModels([]);
    }
  }, [currentOrganization?.aiModelConfigs]);

  const activeCount = useMemo(
    () => models.filter((model) => model.status === "active").length,
    [models],
  );

  const uniqueUseCases = useMemo(() => {
    return Array.from(new Set(models.map((model) => model.useCase).filter(Boolean))).slice(0, 4);
  }, [models]);

  const lastSync = useMemo(() => {
    if (!models.length) return null;
    return models
      .slice()
      .sort((a, b) =>
        new Date(b.lastTrainedAt ?? 0).getTime() - new Date(a.lastTrainedAt ?? 0).getTime(),
      )[0];
  }, [models]);

  const providers = useMemo(() => {
    return Array.from(new Set(models.map((model) => model.provider))).slice(0, 6);
  }, [models]);

  const addModel = () => {
    if (!newModel.name.trim()) {
      toast({
        title: "Nom requis",
        description: "Ajoutez un nom pour créer une configuration.",
        variant: "destructive",
      });
      return;
    }

    if (!newModel.useCase.trim()) {
      toast({
        title: "Cas d'usage requis",
        description: "Précisez l'objectif principal du modèle.",
        variant: "destructive",
      });
      return;
    }

    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}`;

    const model: AIModelConfig = {
      id,
      name: newModel.name.trim(),
      provider: newModel.provider,
      useCase: newModel.useCase.trim(),
      status: newModel.status,
      temperature: Number.isFinite(newModel.temperature) ? newModel.temperature : undefined,
      maxTokens: Number.isFinite(newModel.maxTokens) ? newModel.maxTokens : undefined,
      instructions: newModel.instructions.trim() || undefined,
      lastTrainedAt: newModel.lastTrainedAt || new Date().toISOString(),
    };

    setModels((prev) => [model, ...prev]);
    setNewModel({
      name: "",
      provider: newModel.provider,
      useCase: "",
      status: "active",
      temperature: 0.7,
      maxTokens: 800,
      instructions: "",
      lastTrainedAt: "",
    });

    toast({
      title: "Modèle ajouté",
      description: "Configuration IA prête à être utilisée.",
    });
  };

  const updateModel = <K extends keyof AIModelConfig>(
    modelId: string,
    field: K,
    value: AIModelConfig[K],
  ) => {
    setModels((prev) =>
      prev.map((model) => (model.id === modelId ? { ...model, [field]: value } : model)),
    );
  };

  const removeModel = (modelId: string) => {
    setModels((prev) => prev.filter((model) => model.id !== modelId));
  };

  const handleSave = async () => {
    if (!currentOrganization) return;

    setSaving(true);
    try {
      await updateCurrentOrganization({ aiModelConfigs: models });
      toast({
        title: "Modèles sauvegardés",
        description: "Vos configurations IA ont été mises à jour.",
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des modèles", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les modèles pour le moment.",
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
              <CardTitle>Modèles IA</CardTitle>
              <CardDescription>
                Sélectionnez une organisation pour gérer vos configurations IA.
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
          <h1 className="text-2xl font-bold">Modèles IA</h1>
          <p className="text-sm text-muted-foreground">
            Centralisez les paramètres d'inférence et assurez un suivi de vos prompts.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Total modèles"
          value={models.length}
          subtitle={models.length ? "Configurations disponibles" : "Ajoutez votre premier modèle"}
          icon={Cpu}
        />
        <DashboardStatCard
          title="Actifs"
          value={activeCount}
          subtitle="Prêts à générer"
          icon={Activity}
        />
        <DashboardStatCard
          title="Cas d'usage"
          value={uniqueUseCases.length}
          subtitle="Diversité des workflows"
          icon={Workflow}
        >
          {uniqueUseCases.length ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {uniqueUseCases.map((useCase) => (
                <Badge key={useCase} variant="secondary">
                  {useCase}
                </Badge>
              ))}
            </div>
          ) : null}
        </DashboardStatCard>
        <DashboardStatCard
          title="Dernière synchro"
          value={lastSync?.lastTrainedAt ? dateFormatter.format(new Date(lastSync.lastTrainedAt)) : "-"}
          subtitle={lastSync ? lastSync.name : "Aucun entraînement enregistré"}
          icon={RefreshCw}
        >
          {providers.length ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {providers.map((provider) => (
                <Badge key={provider} variant="secondary">
                  {provider}
                </Badge>
              ))}
            </div>
          ) : null}
        </DashboardStatCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter un modèle</CardTitle>
          <CardDescription>
            Définissez les paramètres d'appel et les instructions d'orchestration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="model-name">Nom</Label>
              <Input
                id="model-name"
                value={newModel.name}
                placeholder="Ex : Rédaction LinkedIn Senior"
                onChange={(event) => setNewModel((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Fournisseur</Label>
              <Select
                value={newModel.provider}
                onValueChange={(value: (typeof PROVIDER_OPTIONS)[number]) =>
                  setNewModel((prev) => ({ ...prev, provider: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_OPTIONS.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Cas d'usage</Label>
            <Input
              value={newModel.useCase}
              placeholder="Brief social media, Email nurturing, FAQ..."
              onChange={(event) => setNewModel((prev) => ({ ...prev, useCase: event.target.value }))}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={newModel.status}
                onValueChange={(value: AIModelConfig["status"]) =>
                  setNewModel((prev) => ({ ...prev, status: value }))
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
            <div className="space-y-2">
              <Label>Température</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={newModel.temperature}
                onChange={(event) =>
                  setNewModel((prev) => ({
                    ...prev,
                    temperature: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Tokens max</Label>
              <Input
                type="number"
                min="1"
                value={newModel.maxTokens}
                onChange={(event) =>
                  setNewModel((prev) => ({
                    ...prev,
                    maxTokens: Number(event.target.value),
                  }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Instructions système</Label>
            <Textarea
              value={newModel.instructions}
              rows={4}
              placeholder="Ton, structure, contraintes, variables dynamiques"
              onChange={(event) => setNewModel((prev) => ({ ...prev, instructions: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Dernière synchronisation</Label>
            <Input
              type="date"
              value={newModel.lastTrainedAt}
              onChange={(event) => setNewModel((prev) => ({ ...prev, lastTrainedAt: event.target.value }))}
            />
          </div>
          <Button onClick={addModel} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Ajouter le modèle
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        {STATUS_OPTIONS.map((statusOption) => {
          const items = models.filter((model) => model.status === statusOption.value);
          return (
            <DashboardEditableListSection
              key={statusOption.value}
              title={statusOption.label}
              description={STATUS_DESCRIPTIONS[statusOption.value]}
              items={items}
              getItemKey={(model) => model.id}
              itemClassName="space-y-3"
              emptyState={
                <p className="text-sm text-muted-foreground">
                  Aucun modèle dans cet état pour le moment.
                </p>
              }
              renderItem={(model) => (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Input
                      value={model.name}
                      onChange={(event) => updateModel(model.id, "name", event.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeModel(model.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Fournisseur</Label>
                      <Select
                        value={model.provider}
                        onValueChange={(value: (typeof PROVIDER_OPTIONS)[number]) =>
                          updateModel(model.id, "provider", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVIDER_OPTIONS.map((provider) => (
                            <SelectItem key={provider} value={provider}>
                              {provider}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Cas d'usage</Label>
                      <Input
                        value={model.useCase}
                        onChange={(event) => updateModel(model.id, "useCase", event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Statut</Label>
                      <Select
                        value={model.status}
                        onValueChange={(value: AIModelConfig["status"]) =>
                          updateModel(model.id, "status", value)
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
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Température</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={model.temperature ?? 0}
                        onChange={(event) =>
                          updateModel(
                            model.id,
                            "temperature",
                            Number.isNaN(Number(event.target.value))
                              ? undefined
                              : Number(event.target.value),
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Tokens max</Label>
                      <Input
                        type="number"
                        min="1"
                        value={model.maxTokens ?? 0}
                        onChange={(event) =>
                          updateModel(
                            model.id,
                            "maxTokens",
                            Number.isNaN(Number(event.target.value))
                              ? undefined
                              : Number(event.target.value),
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Instructions</Label>
                    <Textarea
                      value={model.instructions ?? ""}
                      rows={4}
                      placeholder="Prompt système, style attendu, variables"
                      onChange={(event) => updateModel(model.id, "instructions", event.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Dernière synchro</Label>
                    <Input
                      type="date"
                      value={model.lastTrainedAt ? model.lastTrainedAt.slice(0, 10) : ""}
                      onChange={(event) =>
                        updateModel(
                          model.id,
                          "lastTrainedAt",
                          event.target.value ? new Date(event.target.value).toISOString() : undefined,
                        )
                      }
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
