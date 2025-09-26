"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { databases } from "@/lib/appwrite-config";
import { ID, Query } from "appwrite";
import ContentGenerator from "@/components/dashboard/ContentGenerator";
import ContentAutomationControls from "@/components/dashboard/ContentAutomationControls";
import { Briefcase, Copy, Trash2 } from "lucide-react";

import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const MotionDiv = motion.div;

export default function VisualContentPage() {
  const { currentOrganization, user } = useAuth();
  const { type, projectId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [existingContents, setExistingContents] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<any>(null);
  const [confirmationText, setConfirmationText] = useState("");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [contentToSchedule, setContentToSchedule] = useState<any>(null);
  const [scheduleDate, setScheduleDate] = useState<string>("");
  const [updatingContentId, setUpdatingContentId] = useState<string | null>(
    null,
  );
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    "linkedin",
  ]);
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [automationEnabled, setAutomationEnabled] = useState(false);

  useEffect(() => {
    if (selectedChannels.length === 0 && automationEnabled) {
      setAutomationEnabled(false);
    }
  }, [selectedChannels, automationEnabled]);


  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId || !currentOrganization) return;
      const res = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID!,
        projectId.toString(),
      );
      setProject(res);
    };

    const fetchContents = async () => {
      if (!projectId || !currentOrganization) return;
      const res = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CONTENTS_COLLECTION_ID!,
        [
          Query.equal("organizationId", currentOrganization.$id),
          Query.equal("projectId", projectId.toString()),
          Query.equal("type", type.toString()),
          Query.orderDesc("createdAt"),
        ],
      );
      setExistingContents(res.documents);
    };

    fetchProject();
    fetchContents();
  }, [projectId, currentOrganization, type]);

  const handleSaveContent = async (
    content: string,
    generatedTopic: string,
  ) => {
    if (!currentOrganization || !projectId || !user) return;
    const topic = generatedTopic?.trim() || content.slice(0, 50);
    const scheduledIso = scheduledAt
      ? new Date(scheduledAt).toISOString()
      : null;
    const automationActive = automationEnabled && selectedChannels.length > 0;
    const now = new Date();
    const scheduleDate = scheduledIso ? new Date(scheduledIso) : null;
    const automationStatus = automationActive
      ? scheduleDate
        ? scheduleDate.getTime() > now.getTime()
          ? "scheduled"
          : "ready"
        : "pending"
      : "manual";
    const doc = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_CONTENTS_COLLECTION_ID!,
      ID.unique(),
      {
        organizationId: currentOrganization.$id,
        projectId: projectId.toString(),
        userId: user.$id,
        type: type.toString(),
        topic,
        content,
        createdAt: new Date().toISOString(),
        channels: selectedChannels,
        scheduledAt: scheduledIso,
        automationEnabled: automationActive,
        automationStatus,
        status: "draft",
        scheduledAt: null,
      },
    );
    setExistingContents((prev) => [doc, ...prev]);
  };

  const handlePublishContent = async (contentId: string) => {
    try {
      setUpdatingContentId(contentId);
      const updated = await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CONTENTS_COLLECTION_ID!,
        contentId,
        {
          status: "published",
          scheduledAt: null,
        },
      );
      setExistingContents((prev) =>
        prev.map((item) => (item.$id === contentId ? updated : item)),
      );
    } catch (error) {
      console.error("Erreur lors de la publication :", error);
    } finally {
      setUpdatingContentId(null);
    }
  };

  const formatDateForInput = (iso?: string | null) => {
    if (!iso) return "";
    const date = new Date(iso);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const openScheduleDialog = (item: any) => {
    setContentToSchedule(item);
    setScheduleDate(formatDateForInput(item.scheduledAt));
    setScheduleDialogOpen(true);
  };

  const resetScheduleState = () => {
    setScheduleDialogOpen(false);
    setContentToSchedule(null);
    setScheduleDate("");
  };

  const handleScheduleContent = async () => {
    if (!contentToSchedule || !scheduleDate) return;

    try {
      setUpdatingContentId(contentToSchedule.$id);
      const scheduledAtISO = new Date(scheduleDate).toISOString();
      const updated = await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CONTENTS_COLLECTION_ID!,
        contentToSchedule.$id,
        {
          status: "scheduled",
          scheduledAt: scheduledAtISO,
        },
      );
      setExistingContents((prev) =>
        prev.map((item) => (item.$id === contentToSchedule.$id ? updated : item)),
      );
      resetScheduleState();
    } catch (error) {
      console.error("Erreur lors de la programmation :", error);
    } finally {
      setUpdatingContentId(null);
    }
  };

  const statusBadgeClass = (status?: string) => {
    switch (status) {
      case "published":
        return "bg-emerald-100 text-emerald-800";
      case "scheduled":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const groupedContents = useMemo(() => {
    const drafts: any[] = [];
    const others: any[] = [];

    existingContents.forEach((item) => {
      const status = item.status ?? "draft";
      if (status === "draft") {
        drafts.push(item);
      } else {
        others.push(item);
      }
    });

    return { drafts, others };
  }, [existingContents]);

  const scheduledDescription = (item: any) => {
    if (item.status !== "scheduled" || !item.scheduledAt) return null;
    try {
      return new Date(item.scheduledAt).toLocaleString();
    } catch (error) {
      return item.scheduledAt;
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteContent = async () => {
    if (confirmationText.toLowerCase() !== "supprimer" || !contentToDelete)
      return;

    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CONTENTS_COLLECTION_ID!,
        contentToDelete.$id,
      );
      setExistingContents((prev) =>
        prev.filter((c) => c.$id !== contentToDelete.$id),
      );
      setShowDeleteModal(false);
      setConfirmationText("");
      setContentToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const orgName = currentOrganization?.name || "Organisation inconnue";
  const orgDesc =
    currentOrganization?.description || "Pas de description disponible.";
  const projectName = project?.name || "Projet inconnu";
  const projectDesc = project?.description || "Pas de description disponible.";

  const fullPrompt = `Contexte :
- Organisation : ${orgName}
  Description : ${orgDesc}
- Projet : ${projectName}
  Description : ${projectDesc}

Génère un contenu de type "${type}" en lien avec ce projet.`;

  return (
    <MotionDiv
      className="flex flex-col gap-6 p-4 sm:p-6 max-w-4xl w-full mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <MotionDiv
        className="space-y-1"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">
          Générateur de contenu <span className="capitalize">{type}</span>
        </h1>
        {project?.name && (
          <div className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground w-fit">
            <Briefcase className="w-4 h-4" />
            {project.name}
          </div>
        )}
        <p className="text-muted-foreground text-sm">
          Créez, copiez et regénérez facilement vos contenus.
        </p>
      </MotionDiv>

      <ContentAutomationControls
        selectedChannels={selectedChannels}
        onChannelsChange={setSelectedChannels}
        scheduledAt={scheduledAt}
        onScheduledAtChange={setScheduledAt}
        automationEnabled={automationEnabled}
        onAutomationChange={setAutomationEnabled}
      />

      <ContentGenerator
        type={type as string}
        title={`Générateur de contenu ${type}`}
        description={fullPrompt}
        placeholder="Ex: marketing digital, bien-être, IA..."
        onGenerated={handleSaveContent}
      />
      <Separator />

      {existingContents.length > 0 ? (
        <MotionDiv
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.05 },
            },
          }}
        >
          <h2 className="text-xl font-semibold">Contenus générés</h2>

            {groupedContents.drafts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Brouillons</h3>
                <div className="grid gap-4">
                  {groupedContents.drafts.map((item, index) => (
                    <MotionDiv
                      key={item.$id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <Card className="transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{item.topic}</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                              {new Date(item.createdAt).toLocaleString()}
                            </CardDescription>
                          </div>
                          <Badge className={cn("text-xs", statusBadgeClass(item.status))}>
                            {(item.status ?? "draft").toUpperCase()}
                          </Badge>
                        </CardHeader>
                        <CardContent>
                          <p className="whitespace-pre-line text-sm">{item.content}</p>
                        </CardContent>
                        <CardFooter className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(item.content, item.$id)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            {copiedId === item.$id ? "Copié !" : "Copier"}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handlePublishContent(item.$id)}
                            disabled={updatingContentId === item.$id}
                          >
                            Publier
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openScheduleDialog(item)}
                            disabled={updatingContentId === item.$id}
                          >
                            Programmer
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setContentToDelete(item);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Supprimer
                          </Button>
                        </CardFooter>
                      </Card>
                    </MotionDiv>
                  ))}
                </div>
              </div>
            )}

            {groupedContents.others.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Programmés & publiés</h3>
                <div className="grid gap-4">
                  {groupedContents.others.map((item, index) => (
                  <MotionDiv
                    key={item.$id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Card className="transition-shadow hover:shadow-md">
                      <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{item.topic}</CardTitle>
                          <CardDescription className="text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString()}
                          </CardDescription>
                          {scheduledDescription(item) && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Programmée pour {scheduledDescription(item)}
                            </p>
                          )}
                        </div>
                        <Badge className={cn("text-xs", statusBadgeClass(item.status))}>
                          {(item.status ?? "draft").toUpperCase()}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-line text-sm">{item.content}</p>
                      </CardContent>
                      <CardFooter className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(item.content, item.$id)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          {copiedId === item.$id ? "Copié !" : "Copier"}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openScheduleDialog(item)}
                          disabled={updatingContentId === item.$id}
                        >
                          Reprogrammer
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setContentToDelete(item);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Supprimer
                        </Button>
                      </CardFooter>
                    </Card>
                  </MotionDiv>
                ))}
              </div>
            </div>
          )}
        </MotionDiv>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-20">
          <h3 className="text-lg font-semibold">Aucun contenu généré</h3>
          <p className="text-sm mt-1">
            Utilisez le générateur ci-dessus pour créer votre premier contenu.
          </p>
        </div>
      )}

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Pour confirmer la suppression, tapez <strong>supprimer</strong>{" "}
            ci-dessous.
          </p>
          <Input
            placeholder="Tapez 'supprimer'"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteContent}
              disabled={confirmationText.toLowerCase() !== "supprimer"}
            >
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              Sélectionnez la date et l'heure auxquelles ce contenu doit être
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
              onClick={handleScheduleContent}
              disabled={!scheduleDate || updatingContentId === contentToSchedule?.$id}
            >
              Programmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MotionDiv>
  );
}
