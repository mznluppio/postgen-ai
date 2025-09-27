"use client";
import { useCallback, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import AuthPage from "@/app/auth/page";
import { useOrganizationMembers } from "@/hooks/useOrganizationMembers";
import { PLAN_LABELS } from "@/lib/plans";

export default function Team() {
  const { currentOrganization, user, refreshUser } = useAuth();
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleTeamResolved = useCallback(async () => {
    await refreshUser();
  }, [refreshUser]);

  const memberOptions = useMemo(
    () => ({
      onTeamResolved: handleTeamResolved,
    }),
    [handleTeamResolved],
  );

  const {
    members,
    loading: membersLoading,
    error,
    isAtLimit,
    limit,
    includedSeats,
    additionalSeatsPurchased,
    remainingSeats,
    seatPolicy,
    inviteMember,
    removeMember,
    refresh,
  } = useOrganizationMembers(currentOrganization, memberOptions);

  const canInvite = useMemo(() => {
    if (!inviteEmail) return false;
    if (isAtLimit) return false;
    return true;
  }, [inviteEmail, isAtLimit]);

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

      <Card>
        <CardHeader>
          <CardTitle>Membres actuels</CardTitle>
          <CardDescription>
            Liste des membres de l'organisation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {membersLoading ? (
            <p className="text-sm text-muted-foreground">
              Chargement des membres...
            </p>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun membre pour le moment.
            </p>
          ) : (
            <ul className="space-y-3">
              {members.map((member) => {
                const isOwner = member.roles.includes("owner");
                const isPending = !member.confirm;
                const statusLabel = isPending
                  ? "Invitation en attente"
                  : "Actif";
                const roleLabel = member.roles[0]
                  ? member.roles[0].charAt(0).toUpperCase() +
                    member.roles[0].slice(1)
                  : "Membre";
                const isCurrentUser = member.userId === user?.$id;

                return (
                  <li
                    key={member.$id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {member.userEmail || member.userName || "Membre"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Rôle : {roleLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isPending ? "secondary" : "default"}>
                        {statusLabel}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            setActionError(null);
                            await removeMember(member.$id);
                            await refresh();
                          } catch (err) {
                            const message =
                              err instanceof Error
                                ? err.message
                                : "Erreur lors de la suppression";
                            setActionError(message);
                          }
                        }}
                        disabled={isOwner || isCurrentUser}
                      >
                        Retirer
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="space-y-1 text-xs text-muted-foreground">
            {limit !== null ? (
              <p>
                {members.length} membre(s) sur {limit} siège(s) autorisé(s) par le plan{" "}
                {PLAN_LABELS[currentOrganization.plan]}.
              </p>
            ) : (
              <p>
                Nombre de membres illimité avec le plan {PLAN_LABELS[currentOrganization.plan]}.
              </p>
            )}
            {includedSeats !== null && (
              <p>
                Pack de base : {includedSeats} siège(s) inclus
                {seatPolicy?.addOn
                  ? ` · ${additionalSeatsPurchased} siège(s) additionnel(s)`
                  : ""}
                {remainingSeats !== null
                  ? ` · ${remainingSeats} siège(s) disponibles`
                  : ""}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inviter un membre</CardTitle>
          <CardDescription>
            Entrez l'adresse e-mail de la personne à inviter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
            <div>
              <Label>Rôle</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Membre</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {isAtLimit && (
            <p className="text-sm text-destructive">
              Limite atteinte : ajoutez des sièges supplémentaires depuis la facturation ou changez de plan pour inviter davantage de membres.
            </p>
          )}
          <Button
            disabled={loading || !canInvite}
            onClick={async () => {
              if (!currentOrganization) return;
              setInviteSuccess(false);
              setActionError(null);
              setLoading(true);
              try {
                await inviteMember(inviteEmail, selectedRole);
                setInviteSuccess(true);
                setInviteEmail("");
                refresh();
              } catch (err) {
                const message =
                  err instanceof Error ? err.message : "Erreur inconnue";
                setActionError(message);
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Invitation en cours..." : "Inviter"}
          </Button>
          {inviteSuccess && (
            <p className="text-sm text-green-600">
              Invitation envoyée avec succès.
            </p>
          )}
          {actionError && (
            <p className="text-sm text-destructive">{actionError}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
