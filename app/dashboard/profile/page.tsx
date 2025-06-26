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
import { Input } from "@/components/ui/input";
import { ID, Storage, Databases } from "appwrite";
import { useState } from "react";
import { client } from "@/lib/appwrite-config";
import { getAvatarUrl } from "@/lib/get-avatar-url";

const storage = new Storage(client);
const databases = new Databases(client);

export default function ProfilePage() {
  const { user, currentOrganization, refreshUser } = useAuth();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Chargement du profil...
      </div>
    );
  }

  const avatarUrl = getAvatarUrl(user.avatar);

  const handleUpload = async () => {
    if (!avatarFile) return;
    setLoading(true);

    try {
      const uploaded = await storage.createFile(
        process.env.NEXT_PUBLIC_APPWRITE_USERAVATARS_ID || "",
        ID.unique(),
        avatarFile,
      );

      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "",
        user.$id,
        {
          avatar: uploaded.$id,
        },
      );

      await refreshUser(); // recharge les données utilisateur
    } catch (err) {
      console.error("Erreur lors de l'upload de l'avatar :", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-col items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
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

          <Separator />

          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            />
            <Button onClick={handleUpload} disabled={loading || !avatarFile}>
              {loading ? "Téléversement..." : "Mettre à jour l'avatar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
