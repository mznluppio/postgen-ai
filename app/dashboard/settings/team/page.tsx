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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import AuthPage from "@/app/auth/page";

export default function Team() {
  const { currentOrganization } = useAuth();
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

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
                  <span className="text-sm text-muted-foreground">
                    {member.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
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
          <Button disabled={loading || !inviteEmail}>
            {loading ? "Invitation en cours..." : "Inviter"}
          </Button>
          {inviteSuccess && (
            <p className="text-sm text-green-600">
              Invitation envoyée avec succès.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
