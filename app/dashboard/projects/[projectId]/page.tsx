"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { databases } from "@/lib/appwrite-config";
import { Query } from "appwrite";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Linkedin,
  Twitter,
  Mail,
  FileText,
  Globe,
  Megaphone,
  MessageSquareText,
  Instagram,
} from "lucide-react";

const typeIcons: Record<string, JSX.Element> = {
  instagram: <Instagram className="w-5 h-5 text-red-500" />,
  linkedin: <Linkedin className="w-5 h-5 text-blue-500" />,
  twitter: <Twitter className="w-5 h-5 text-sky-400" />,
  email: <Mail className="w-5 h-5 text-rose-400" />,
  article: <FileText className="w-5 h-5 text-emerald-400" />,
  blog: <Globe className="w-5 h-5 text-orange-400" />,
  pub: <Megaphone className="w-5 h-5 text-yellow-400" />,
  message: <MessageSquareText className="w-5 h-5 text-purple-400" />,
};

export default function ProjectContentList() {
  const { projectId } = useParams();
  const [contents, setContents] = useState<any[]>([]);
  const [filteredType, setFilteredType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchContents = async () => {
      if (!projectId) return;
      try {
        const res = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_CONTENTS_COLLECTION_ID!,
          [
            Query.equal("projectId", projectId.toString()),
            Query.orderDesc("createdAt"),
          ],
        );
        setContents(res.documents);
      } catch (error) {
        console.error("Erreur lors du chargement des contenus :", error);
      }
    };

    fetchContents();
  }, [projectId]);

  const types = Array.from(new Set(contents.map((c) => c.type)));

  const filteredContents = contents.filter((c) => {
    const matchesType = filteredType ? c.type === filteredType : true;
    const matchesSearch =
      c.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.content?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground">Contenus générés</h1>
        <p className="text-muted-foreground text-sm">
          Tous les contenus générés pour ce projet, classés par type et mot-clé.
        </p>
      </div>

      <Input
        placeholder="Rechercher par mot-clé..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />

      {types.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={filteredType === null ? "default" : "outline"}
            onClick={() => setFilteredType(null)}
            className="cursor-pointer"
          >
            Tous
          </Badge>
          {types.map((type) => (
            <Badge
              key={type}
              variant={filteredType === type ? "default" : "outline"}
              onClick={() => setFilteredType(type)}
              className="capitalize cursor-pointer"
            >
              {type}
            </Badge>
          ))}
        </div>
      )}

      <Separator />

      {filteredContents.length === 0 ? (
        <p className="text-muted-foreground">Aucun contenu trouvé.</p>
      ) : (
        filteredContents.map((item) => (
          <Card key={item.$id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                {typeIcons[item.type?.toLowerCase()] || (
                  <FileText className="w-5 h-5 text-muted-foreground" />
                )}
                <span className="capitalize">{item.type}</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="font-medium mb-2">{item.topic}</h3>
              <p className="whitespace-pre-line text-sm">{item.content}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
