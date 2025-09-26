"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import AuthPage from "../../auth/page";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { databases } from "@/lib/appwrite-config";
import { Query } from "appwrite";
import {
  CHANNEL_LABELS,
  formatScheduleDisplay,
  getAutomationBadgeVariant,
  getAutomationStatusLabel,
} from "@/lib/content-automation";
import {
  Copy,
  Download,
  Filter,
  Loader2,
  RefreshCw,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface StoredContent {
  $id: string;
  topic?: string;
  content?: string;
  type?: string;
  status?: string;
  projectId?: string;
  channels?: string[];
  createdAt?: string;
  scheduledAt?: string | null;
  automationStatus?: string;
  automationEnabled?: boolean;
  organizationId?: string;
}

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  scheduled: "Planifié",
  published: "Publié",
};

export default function LibraryPage() {
  const { currentOrganization } = useAuth();
  const [contents, setContents] = useState<StoredContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchContents = async (organizationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await databases.listDocuments<StoredContent>(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CONTENTS_COLLECTION_ID!,
        [
          Query.equal("organizationId", organizationId),
          Query.orderDesc("createdAt"),
        ],
      );
      setContents(response.documents);
    } catch (err) {
      console.error("Erreur lors du chargement de la bibliothèque", err);
      setError(
        "Impossible de récupérer la bibliothèque de contenus. Vérifiez vos collections Appwrite.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentOrganization) return;
    fetchContents(currentOrganization.$id);
  }, [currentOrganization]);

  const availableTypes = useMemo(() => {
    const unique = new Set<string>();
    contents.forEach((item) => {
      if (item.type) {
        unique.add(item.type);
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [contents]);

  const filteredContents = useMemo(() => {
    return contents.filter((item) => {
      const matchesSearch = searchTerm
        ? [item.topic, item.content, item.type]
            .map((field) => field?.toLowerCase() ?? "")
            .some((field) => field.includes(searchTerm.toLowerCase()))
        : true;
      const matchesType =
        typeFilter === "all" || (item.type ?? "").toLowerCase() === typeFilter;
      const matchesStatus =
        statusFilter === "all" || (item.status ?? "draft").toLowerCase() === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [contents, searchTerm, statusFilter, typeFilter]);

  const handleCopy = async (item: StoredContent) => {
    if (!item.content) return;
    await navigator.clipboard.writeText(item.content);
    setCopiedId(item.$id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = (item: StoredContent) => {
    const payload = {
      ...item,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeTopic = item.topic?.trim().replace(/\s+/g, "-") || "content";
    link.download = `${safeTopic}-${item.$id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const refresh = () => {
    if (!currentOrganization) return;
    fetchContents(currentOrganization.$id);
  };

  return (
    <AuthGuard fallback={<AuthPage />}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold">Bibliothèque de contenus</h1>
              <p className="text-sm text-muted-foreground">
                Retrouvez et réutilisez facilement tous les contenus générés.
              </p>
            </div>
            <Button variant="outline" onClick={refresh} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualisation…
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualiser
                </>
              )}
            </Button>
          </div>

          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Filtres intelligents</CardTitle>
              <CardDescription>
                Affinez vos recherches par type de contenu, statut et mots-clés.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase text-muted-foreground">
                  Recherche
                </label>
                <Input
                  placeholder="Sujet, extrait de contenu, type…"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase text-muted-foreground">
                  Type
                </label>
                <Select
                  value={typeFilter}
                  onValueChange={(value) => setTypeFilter(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {availableTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase text-muted-foreground">
                  Statut
                </label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="draft">Brouillons</SelectItem>
                    <SelectItem value="scheduled">Planifiés</SelectItem>
                    <SelectItem value="published">Publiés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex items-center gap-2 text-xs text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              {filteredContents.length} contenu(x) sur {contents.length} éléments indexés
            </CardFooter>
          </Card>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Chargement impossible</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          {loading && !contents.length ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Chargement de votre bibliothèque…
            </div>
          ) : filteredContents.length ? (
            filteredContents.map((item) => {
              const status = (item.status ?? "draft").toLowerCase();
              const statusLabel = statusLabels[status] ?? status;
              return (
                <Card key={item.$id} className="border shadow-sm">
                  <CardHeader>
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {item.topic || "Sujet sans titre"}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString()
                            : "Date inconnue"}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {item.type || "Type non défini"}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {statusLabel}
                        </Badge>
                        <Badge variant={getAutomationBadgeVariant(item.automationStatus)}>
                          {getAutomationStatusLabel(item.automationStatus)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-md border bg-muted/40 p-3 text-sm whitespace-pre-line">
                      {item.content || "Aucun contenu enregistré."}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {(item.channels ?? []).length ? (
                        item.channels?.map((channel) => (
                          <Badge
                            key={channel}
                            variant="secondary"
                            className="capitalize"
                          >
                            {CHANNEL_LABELS[channel] ?? channel}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline">Canaux non définis</Badge>
                      )}
                      {item.scheduledAt && (
                        <span>
                          Planifié pour {formatScheduleDisplay(item.scheduledAt)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-muted-foreground">
                      ID contenu : {item.$id}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(item)}
                      >
                        <Copy className="mr-1 h-4 w-4" />
                        {copiedId === item.$id ? "Copié !" : "Copier"}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleExport(item)}
                      >
                        <Download className="mr-1 h-4 w-4" />
                        Exporter
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>Aucun contenu ne correspond à vos filtres</CardTitle>
                <CardDescription>
                  Ajustez votre recherche ou générez de nouveaux contenus pour alimenter la bibliothèque.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tous les contenus générés apparaîtront automatiquement ici avec leurs métadonnées et canaux associés.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
