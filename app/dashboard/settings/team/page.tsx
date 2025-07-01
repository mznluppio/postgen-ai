"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AceternityButton } from "@/components/ui/aceternity-button";
import { AnimataCard } from "@/components/ui/animata-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import AuthPage from "@/app/auth/page";
import { authService } from "@/lib/auth";

export default function Team() {
  const { currentOrganization } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!currentOrganization) return;
      try {
        const res = await authService.getOrganizationMembers(
          currentOrganization.$id,
        );
        setMembers(res);
      } catch (err) {
        console.error("Erreur lors du chargement des membres:", err);
      }
    };

    fetchMembers();
  }, [currentOrganization]);

  const handleInvite = async () => {
    if (!inviteEmail || !currentOrganization) return;
    setLoading(true);
    setInviteSuccess(false);
    try {
      await authService.inviteMemberByEmail(currentOrganization.$id, inviteEmail);
      const updated = await authService.getOrganizationMembers(currentOrganization.$id);
      setMembers(updated);
      setInviteEmail("");
      setInviteSuccess(true);
    } catch (err) {
      console.error("Erreur lors de l'invitation:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!currentOrganization) return;
    try {
      await authService.removeMemberFromOrganization(
        currentOrganization.$id,
        memberId,
      );
      setMembers((prev) => prev.filter((m) => m.$id !== memberId));
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
    }
  };

  if (!currentOrganization) {
    return (
      <AuthGuard fallback={<AuthPage />}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Équipe</CardTitle>
              <CardDescription>
                Veuillez créer une organisation pour voir les membres.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Équipe de l'organisation</h1>
      <Separator />

      <AnimataCard>
        <CardHeader>
          <CardTitle>Membres actuels</CardTitle>
          <CardDescription>
            Liste des membres de l'organisation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun membre pour le moment.
            </p>
          ) : (
            <ul className="space-y-2">
              {members.map((member) => (
                <li
                  key={member.$id}
                  className="flex justify-between items-center"
                >
                  <span>{member.email}</span>
                  <AceternityButton
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 text-sm"
                    onClick={() => handleRemove(member.$id)}
                  >
                    Retirer
                  </AceternityButton>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </AnimataCard>

      <AnimataCard>
        <CardHeader>
          <CardTitle>Inviter un membre</CardTitle>
          <CardDescription>
            Entrez l'adresse e-mail de la personne à inviter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="exemple@domaine.com"
            />
          </div>
          <AceternityButton
            onClick={handleInvite}
            disabled={loading || !inviteEmail}
            className="px-3 py-1"
          >
            {loading ? "Invitation en cours..." : "Inviter"}
          </AceternityButton>
          {inviteSuccess && (
            <p className="text-sm text-green-600">
              Invitation envoyée avec succès.
            </p>
          )}
        </CardContent>
      </AnimataCard>
    </div>
  );
}
