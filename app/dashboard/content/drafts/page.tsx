"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { databases } from "@/lib/appwrite-config";
import { Query } from "appwrite";
import { Loader2, ArrowUpRight, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraftDocument {
  $id: string;
  projectId?: string;
  type?: string;
  topic?: string;
  content?: string;
  channels?: string[];
  createdAt?: string;
  scheduledAt?: string | null;
  status?: string;
}

export default function DraftsPage() {
  const { currentOrganization } = useAuth();
  const [drafts, setDrafts] = useState<DraftDocument[]>([]);
  const [projectsMap, setProjectsMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [draftToSchedule, setDraftToSchedule] = useState<DraftDocument | null>(
    null,
  );
  const [scheduleDate, setScheduleDate] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<DraftDocument | null>(
    null,
  );
  const [confirmationText, setConfirmationText] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentOrganization) return;

    const fetchDrafts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_CONTENTS_COLLECTION_ID!,
          [
            Query.equal("organizationId", currentOrganization.$id),
            Query.equal("status", "draft"),
            Query.orderDesc("createdAt"),
          ],
        );
        setDrafts(res.documents as DraftDocument[]);

        const projectIds = Array.from(
          new Set(
            res.documents
              .map((doc) => doc.projectId)
              .filter((id): id is string => Boolean(id)),
          ),
        );

        if (projectIds.length) {
          const entries = await Promise.all(
            projectIds.map(async (id) => {
              try {
                const project = await databases.getDocument(
                  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                  process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID!,
                  id,
                );
                return [id, project];
              } catch (error) {
                console.error("Erreur lors du chargement du projet", error);
                return null;
              }
            }),
          );
          setProjectsMap(
            Object.fromEntries(entries.filter((entry): entry is [string, any] => Boolean(entry))),
          );
        } else {
          setProjectsMap({});
        }
      } catch (err) {
        console.error("Erreur lors du chargement des brouillons", err);
        setError("Impossible de charger les brouillons pour le moment.");
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [currentOrganization]);

  const resetScheduleState = () => {
    setScheduleDialogOpen(false);
    setDraftToSchedule(null);
    setScheduleDate("");
    setUpdatingId(null);
  };

  const formatDateForInput = (iso?: string | null) => {
    if (!iso) return "";
    const date = new Date(iso);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const formatChannels = (channels?: string[]) =>
    (channels ?? []).filter(Boolean);

  const getProjectName = (projectId?: string) => {
    if (!projectId) return "Projet inconnu";
    return projectsMap[projectId]?.name ?? projectId;
  };

  const getEditLink = (draft: DraftDocument) => {
    const base = draft.channels?.[0] ?? "social";
    const typeSegment = draft.type ?? "general";
    const projectSegment = draft.projectId ?? "";
    return `/dashboard/content/${base}/${typeSegment}/${projectSegment}`;
  };

  const handleCopy = async (content: string | undefined, id: string) => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePublish = async (draftId: string) => {
    try {
      setUpdatingId(draftId);
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CONTENTS_COLLECTION_ID!,
        draftId,
        {
          status: "published",
          scheduledAt: null,
        },
      );
      setDrafts((prev) => prev.filter((item) => item.$id !== draftId));
    } catch (error) {
      console.error("Erreur lors de la publication du brouillon", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const openScheduleDialog = (draft: DraftDocument) => {
    setDraftToSchedule(draft);
    setScheduleDate(formatDateForInput(draft.scheduledAt));
    setScheduleDialogOpen(true);
  };

  const handleSchedule = async () => {
    if (!draftToSchedule || !scheduleDate) return;

    try {
      setUpdatingId(draftToSchedule.$id);
      const scheduledAtISO = new Date(scheduleDate).toISOString();
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CONTENTS_COLLECTION_ID!,
        draftToSchedule.$id,
        {
          status: "scheduled",
          scheduledAt: scheduledAtISO,
        },
      );
      setDrafts((prev) => prev.filter((item) => item.$id !== draftToSchedule.$id));
      resetScheduleState();
    } catch (error) {
      console.error("Erreur lors de la programmation du brouillon", error);
      setUpdatingId(null);
    }
  };

  const openDeleteDialog = (draft: DraftDocument) => {
    setDraftToDelete(draft);
    setConfirmationText("");
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!draftToDelete || confirmationText.toLowerCase() !== "supprimer") return;
    try {
      setUpdatingId(draftToDelete.$id);
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CONTENTS_COLLECTION_ID!,
        draftToDelete.$id,
      );
      setDrafts((prev) => prev.filter((item) => item.$id !== draftToDelete.$id));
      setDeleteDialogOpen(false);
      setDraftToDelete(null);
      setConfirmationText("");
    } catch (error) {
      console.error("Erreur lors de la suppression du brouillon", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const statusBadgeClass = (status?: string) => {
    switch (status) {
      case "scheduled":
        return "bg-amber-100 text-amber-800";
      case "published":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (!currentOrganization) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Brouillons</CardTitle>
            <CardDescription>
              Connectez-vous à une organisation pour accéder à vos brouillons.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Brouillons</h1>
        <p className="text-muted-foreground">
          Retrouvez tous vos contenus en attente de validation, prêts à être
          publiés ou programmés.
        </p>
      </div>

      <Separator />

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement des brouillons...
        </div>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle>Une erreur est survenue</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : drafts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Pas encore de brouillon</CardTitle>
            <CardDescription>
              Générer un nouveau contenu pour l’enregistrer ici en brouillon.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {drafts.map((draft) => {
            const projectName = getProjectName(draft.projectId);
            const editHref = getEditLink(draft);
            const channels = formatChannels(draft.channels);
            return (
              <Card key={draft.$id} className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {draft.topic || "Sujet sans titre"}
                      <Badge className={cn("text-xs", statusBadgeClass(draft.status))}>
                        {(draft.status ?? "draft").toUpperCase()}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Projet : {projectName}
                    </CardDescription>
                    {channels.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {channels.map((channel) => (
                          <Badge key={channel} variant="secondary" className="text-xs">
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={editHref} className="inline-flex items-center gap-1">
                      Modifier
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-4 whitespace-pre-line text-sm text-muted-foreground">
                    {draft.content}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(draft.content, draft.$id)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    {copiedId === draft.$id ? "Copié !" : "Copier"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handlePublish(draft.$id)}
                    disabled={updatingId === draft.$id}
                  >
                    Publier
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openScheduleDialog(draft)}
                    disabled={updatingId === draft.$id}
                  >
                    Programmer
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteDialog(draft)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={scheduleDialogOpen}
        onOpenChange={(open) => {
          setScheduleDialogOpen(open);
          if (!open) {
            resetScheduleState();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Programmer la publication</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="schedule-date">Date de publication</Label>
              <Input
                id="schedule-date"
                type="datetime-local"
                value={scheduleDate}
                onChange={(event) => setScheduleDate(event.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Sélectionnez la date et l'heure auxquelles ce brouillon doit être
              publié.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetScheduleState();
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={!scheduleDate || updatingId === draftToSchedule?.$id}
            >
              Programmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le brouillon</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tapez <strong>supprimer</strong> pour confirmer la suppression
            définitive de ce brouillon.
          </p>
          <Input
            placeholder="Tapez 'supprimer'"
            value={confirmationText}
            onChange={(event) => setConfirmationText(event.target.value)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDraftToDelete(null);
                setConfirmationText("");
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                confirmationText.toLowerCase() !== "supprimer" ||
                updatingId === draftToDelete?.$id
              }
            >
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
