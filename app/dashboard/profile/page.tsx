"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, currentOrganization, logout } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Chargement du profil...
      </div>
    );
  }

  return (
    <div className="p-6 ">
      <Card>
        <CardHeader>
          <CardTitle>Profil utilisateur</CardTitle>
          <CardDescription>
            Informations associées à votre compte Appwrite
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Nom</p>
            <p className="font-medium">{user.name}</p>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground">ID utilisateur</p>
            <p className="font-mono text-xs break-all">{user.$id}</p>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground">
              Organisation actuelle
            </p>
            <p className="font-medium">
              {currentOrganization ? currentOrganization.name : "Aucune"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
