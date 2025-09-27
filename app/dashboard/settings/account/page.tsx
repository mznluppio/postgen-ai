"use client";

import { useEffect, useMemo, useState } from "react";

import AuthPage from "@/app/auth/page";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";

const LANGUAGES = [
  { value: "fr", label: "Français" },
  { value: "en", label: "Anglais" },
  { value: "es", label: "Espagnol" },
];

const TIMEZONES = [
  { value: "Europe/Paris", label: "Europe/Paris (UTC+1)" },
  { value: "Europe/Brussels", label: "Europe/Bruxelles (UTC+1)" },
  { value: "America/Montreal", label: "Amérique/Montréal (UTC-5)" },
];

export default function AccountSettingsPage() {
  const { user, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [language, setLanguage] = useState("fr");
  const [timezone, setTimezone] = useState("Europe/Paris");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const defaultCommunicationPrefs = useMemo(
    () => ({
      productUpdates: true,
      weeklySummary: true,
      securityAlerts: true,
    }),
    [],
  );

  const [communicationPrefs, setCommunicationPrefs] = useState(defaultCommunicationPrefs);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSuccess, setPrefsSuccess] = useState<string | null>(null);
  const [prefsError, setPrefsError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    setDisplayName(user.name ?? "");
    setLanguage(user.language ?? "fr");
    setTimezone(user.timezone ?? "Europe/Paris");
    setCommunicationPrefs({
      productUpdates: user.communicationPreferences?.productUpdates ?? true,
      weeklySummary: user.communicationPreferences?.weeklySummary ?? true,
      securityAlerts: user.communicationPreferences?.securityAlerts ?? true,
    });
  }, [user]);

  if (!user) {
    return (
      <AuthGuard fallback={<AuthPage />}>
        <div className="flex min-h-[60vh] items-center justify-center p-6 text-muted-foreground">
          Chargement du compte...
        </div>
      </AuthGuard>
    );
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      await updateUserProfile({
        name: displayName,
        language,
        timezone,
      });
      setProfileSuccess("Profil mis à jour avec succès.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible d'enregistrer les modifications.";
      setProfileError(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveCommunication = async () => {
    setSavingPrefs(true);
    setPrefsSuccess(null);
    setPrefsError(null);

    try {
      await updateUserProfile({
        communicationPreferences: communicationPrefs,
      });
      setPrefsSuccess("Préférences de communication enregistrées.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible d'enregistrer les préférences.";
      setPrefsError(message);
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Paramètres du compte</h1>
        <p className="text-sm text-muted-foreground">
          Actualisez vos informations personnelles et choisissez comment Postgen AI communique avec vous.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Vos informations sont utilisées dans les notifications et les actions collaboratives.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="display-name">Nom affiché</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Votre nom complet"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input id="email" value={user.email} disabled />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Langue de l'interface</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une langue" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fuseau horaire</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un fuseau horaire" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Vos préférences seront synchronisées sur tous vos espaces de travail.
          </div>
          <div className="space-y-1 text-right">
            <Button onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? "Enregistrement..." : "Enregistrer"}
            </Button>
            {profileSuccess && (
              <p className="text-xs text-green-600">{profileSuccess}</p>
            )}
            {profileError && (
              <p className="text-xs text-destructive">{profileError}</p>
            )}
          </div>
        </CardFooter>
      </Card>

      <Card id="notifications">
        <CardHeader>
          <CardTitle>Notifications & communication</CardTitle>
          <CardDescription>
            Choisissez comment nous vous tenons informé des nouveautés et des activités importantes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="font-medium">Alertes de sécurité</p>
              <p className="text-sm text-muted-foreground">
                Recevez immédiatement un email en cas d'activité suspecte ou de mise à jour critique.
              </p>
            </div>
            <Switch
              checked={communicationPrefs.securityAlerts}
              onCheckedChange={(checked) =>
                setCommunicationPrefs((previous) => ({
                  ...previous,
                  securityAlerts: checked,
                }))
              }
            />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="font-medium">Résumé hebdomadaire</p>
              <p className="text-sm text-muted-foreground">
                Recevez chaque lundi un résumé des performances et des actions à venir.
              </p>
            </div>
            <Switch
              checked={communicationPrefs.weeklySummary}
              onCheckedChange={(checked) =>
                setCommunicationPrefs((previous) => ({
                  ...previous,
                  weeklySummary: checked,
                }))
              }
            />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">Mises à jour produit</p>
                <Badge variant="secondary">Recommandé</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Soyez informé des nouvelles fonctionnalités, webinaires et bonnes pratiques.
              </p>
            </div>
            <Switch
              checked={communicationPrefs.productUpdates}
              onCheckedChange={(checked) =>
                setCommunicationPrefs((previous) => ({
                  ...previous,
                  productUpdates: checked,
                }))
              }
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Vous pourrez vous désinscrire à tout moment depuis chaque email reçu.
          </div>
          <div className="space-y-1 text-right">
            <Button onClick={handleSaveCommunication} disabled={savingPrefs}>
              {savingPrefs ? "Enregistrement..." : "Enregistrer les préférences"}
            </Button>
            {prefsSuccess && <p className="text-xs text-green-600">{prefsSuccess}</p>}
            {prefsError && <p className="text-xs text-destructive">{prefsError}</p>}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
