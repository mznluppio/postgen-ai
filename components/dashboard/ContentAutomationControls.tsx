"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AUTOMATION_CHANNELS, formatScheduleDisplay } from "@/lib/content-automation";
import { useMemo } from "react";

interface ContentAutomationControlsProps {
  selectedChannels: string[];
  onChannelsChange: (channels: string[]) => void;
  scheduledAt: string;
  onScheduledAtChange: (value: string) => void;
  automationEnabled: boolean;
  onAutomationChange: (value: boolean) => void;
  disabled?: boolean;
  disableReason?: string;
  loading?: boolean;
}

export default function ContentAutomationControls({
  selectedChannels,
  onChannelsChange,
  scheduledAt,
  onScheduledAtChange,
  automationEnabled,
  onAutomationChange,
  disabled = false,
  disableReason,
  loading = false,
}: ContentAutomationControlsProps) {
  const minDateTimeValue = useMemo(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }, []);

  const isDisabled = disabled || loading;

  const statusLabel = useMemo(() => {
    if (isDisabled) {
      if (loading) {
        return "Vérification des prérequis…";
      }
      return disableReason || "Planification verrouillée";
    }
    if (!automationEnabled) {
      return "Automatisation désactivée (publication manuelle)";
    }

    if (!scheduledAt) {
      return "Automatisation activée (en attente de planification)";
    }

    return `Automatisation programmée le ${formatScheduleDisplay(scheduledAt)}`;
  }, [automationEnabled, disableReason, isDisabled, loading, scheduledAt]);

  const handleChannelToggle = (channelId: string, nextValue: boolean) => {
    if (isDisabled) {
      return;
    }
    if (nextValue) {
      onChannelsChange(Array.from(new Set([...selectedChannels, channelId])));
    } else {
      onChannelsChange(selectedChannels.filter((id) => id !== channelId));
    }
  };

  return (
    <Card className={`border-dashed ${isDisabled ? "opacity-60" : ""}`}>
      <CardHeader>
        <CardTitle className="text-lg">Diffusion & automatisation</CardTitle>
        <CardDescription>
          Choisissez les canaux de publication, planifiez un horaire et
          contrôlez l'automatisation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Canaux de diffusion</Label>
          <div className="flex flex-wrap gap-3">
            {AUTOMATION_CHANNELS.map((channel) => {
              const id = `channel-${channel.id}`;
              return (
                <div key={channel.id} className="flex items-center gap-2">
                  <Checkbox
                    id={id}
                    checked={selectedChannels.includes(channel.id)}
                    onCheckedChange={(checked) =>
                      handleChannelToggle(channel.id, Boolean(checked))
                    }
                    disabled={isDisabled}
                  />
                  <Label htmlFor={id} className="text-sm">
                    {channel.label}
                  </Label>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Sélectionnez au moins un canal pour activer l'automatisation.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduledAt" className="text-sm font-medium">
            Planifier la publication
          </Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => {
              if (isDisabled) return;
              onScheduledAtChange(event.target.value);
            }}
            min={minDateTimeValue}
            disabled={isDisabled}
          />
          <p className="text-xs text-muted-foreground">
            Définissez un horaire pour diffuser automatiquement votre contenu.
            L'heure est basée sur votre fuseau horaire local.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
          <div className="space-y-1">
            <p className="text-sm font-medium">Automatisation</p>
            <p className="text-xs text-muted-foreground">
              Activez pour laisser Postgen publier automatiquement aux heures
              programmées.
            </p>
          </div>
          <Switch
            checked={automationEnabled}
            onCheckedChange={(checked) => {
              if (isDisabled) return;
              onAutomationChange(Boolean(checked));
            }}
            disabled={isDisabled || selectedChannels.length === 0}
          />
        </div>

        <Badge
          variant={!isDisabled && automationEnabled ? "default" : "outline"}
        >
          {statusLabel}
        </Badge>
        {isDisabled && disableReason && !loading && (
          <p className="text-xs text-muted-foreground">{disableReason}</p>
        )}
      </CardContent>
    </Card>
  );
}
