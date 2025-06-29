"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimataCard } from "@/components/ui/animata-card";
import { AcertenityButton } from "@/components/ui/acertenity-button";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AccountPage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setMessage("");
    try {
      if (name && name !== user.name) {
        await authService.updateAccountName(name);
      }
      if (password) {
        await authService.updatePassword(password);
      }
      await refreshUser();
      setPassword("");
      setMessage("Mise \u00e0 jour effectu\u00e9e.");
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la mise \u00e0 jour");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Param\u00e8tres du compte</h1>
      <Separator />
      <AnimataCard className="max-w-md">
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom complet"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
            />
          </div>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
          <AcertenityButton onClick={handleSave} disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </AcertenityButton>
        </CardContent>
      </AnimataCard>
    </div>
  );
}
