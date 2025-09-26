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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { databases } from "@/lib/appwrite-config";
import { ID, Query } from "appwrite";
import ContentGenerator from "@/components/dashboard/ContentGenerator";
import ContentAutomationControls from "@/components/dashboard/ContentAutomationControls";
import {
  CHANNEL_LABELS,
  formatScheduleDisplay,
  getAutomationBadgeVariant,
  getAutomationStatusLabel,
} from "@/lib/content-automation";
import {
  EMAIL_SEGMENT_OPTIONS,
  EMAIL_SEGMENT_LABELS,
  getEmailContentType,
} from "@/lib/email-content";
import { Briefcase, Copy, Trash2, Code2, Mail } from "lucide-react";
import { motion } from "framer-motion";

interface EmailContentState {
  body: string;
  topic: string;
  subject: string;
  htmlPreview: string;
}

const DEFAULT_SEGMENTS = [EMAIL_SEGMENT_OPTIONS[0]?.id ?? "all"];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtmlPreview(content: string): string {
  if (!content) return "";
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) =>
      `<p>${escapeHtml(paragraph.trim()).replace(/\n/g, "<br />")}</p>`,
    )
    .join("\n");

  return `<section>${paragraphs}</section>`;
}

function deriveSubject(topic: string, content: string): string {
  if (topic) {
    return topic.length > 120 ? `${topic.slice(0, 117)}...` : topic;
  }

  const firstLine = content.split("\n")[0]?.trim() ?? "";
  if (firstLine) {
    return firstLine.length > 120 ? `${firstLine.slice(0, 117)}...` : firstLine;
  }

  return "Nouvelle campagne email";
}

export default function EmailContentPage() {
  const { currentOrganization, user } = useAuth();
  const { type, projectId } = useParams();
  const emailType = getEmailContentType(type);
  const [project, setProject] = useState<any>(null);
  const [existingContents, setExistingContents] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedHtmlId, setCopiedHtmlId] = useState<string | null>(null);
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
    "email",
  ]);
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [selectedSegments, setSelectedSegments] = useState<string[]>(
    DEFAULT_SEGMENTS,
  );
  const [pendingEmail, setPendingEmail] = useState<EmailContentState | null>(
    null,
  );

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
          Query.equal("type", type?.toString()),
          Query.orderDesc("createdAt"),
        ],
      );
      setExistingContents(res.documents);
    };

    fetchProject();
    fetchContents();
  }, [projectId, currentOrganization, type]);

  const handleGeneratorOutput = (content: string, generatedTopic: string) => {
    const subject = deriveSubject(generatedTopic, content);
    const htmlPreview = buildHtmlPreview(content);
    setPendingEmail({
      body: content,
      topic: generatedTopic,
      subject,
      htmlPreview,
    });
    setSelectedSegments(DEFAULT_SEGMENTS);
  };

  const resetPendingEmail = () => {
    setPendingEmail(null);
    setSelectedSegments(DEFAULT_SEGMENTS);
  };

  const handleSaveEmail = async () => {
    if (!currentOrganization || !projectId || !user || !pendingEmail) return;

    const scheduledIso = scheduledAt
      ? new Date(scheduledAt).toISOString()
      : null;
    const automationActive = automationEnabled && selectedChannels.length > 0;
    const now = new Date();
    const scheduleDateValue = scheduledIso ? new Date(scheduledIso) : null;
    const automationStatus = automationActive
      ? scheduleDateValue
        ? scheduleDateValue.getTime() > now.getTime()
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
        type: type?.toString(),
        topic: pendingEmail.topic || pendingEmail.subject,
        content: pendingEmail.body,
        createdAt: new Date().toISOString(),
        channels: selectedChannels,
        scheduledAt: scheduledIso,
        automationEnabled: automationActive,
        automationStatus,
        status: "draft",
        emailSubject: pendingEmail.subject,
        emailSegments: selectedSegments,
        emailHtmlPreview: pendingEmail.htmlPreview,
      },
    );

    setExistingContents((prev) => [doc, ...prev]);
    resetPendingEmail();
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

  const handleCopy = async (
    text: string,
    id: string,
    setState: (value: string | null) => void,
  ) => {
    await navigator.clipboard.writeText(text);
    setState(id);
    setTimeout(() => setState(null), 2000);
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

Génère une campagne email de type "${emailType?.title ?? type}" en lien avec ce projet.`;

  if (!emailType) {
    return (
      <motion.div
        className="p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Format email introuvable</CardTitle>
            <CardDescription>
              Ce type de campagne n'est pas reconnu. Revenez à la sélection
              précédente pour choisir un format valide.
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-6 p-4 sm:p-6 max-w-5xl w-full mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="space-y-1"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">
          {emailType?.title ?? "Campagne email"}
        </h1>
        {project?.name && (
          <div className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground w-fit">
            <Briefcase className="w-4 h-4" />
            {project.name}
          </div>
        )}
        <p className="text-muted-foreground text-sm">
          Préparez vos campagnes email, personnalisez l'objet, visualisez le
          rendu HTML et pilotez l'automatisation.
        </p>
      </motion.div>

      <ContentAutomationControls
        selectedChannels={selectedChannels}
        onChannelsChange={setSelectedChannels}
        scheduledAt={scheduledAt}
        onScheduledAtChange={setScheduledAt}
        automationEnabled={automationEnabled}
        onAutomationChange={setAutomationEnabled}
      />

      <ContentGenerator
        type={(emailType?.generatorType ?? type ?? "email") as string}
        title={`Générateur ${emailType?.title ?? "email"}`}
        description={fullPrompt}
        placeholder="Ex: lancement produit, remerciement clients, onboarding..."
        onGenerated={handleGeneratorOutput}
      />

      {pendingEmail ? (
        <Card className="border-primary/40 border-dashed">
          <CardHeader className="space-y-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Prévisualisation de l'email
            </CardTitle>
            <CardDescription>
              Ajustez l'objet et la segmentation avant d'enregistrer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-subject">Objet de l'email</Label>
              <Input
                id="email-subject"
                value={pendingEmail.subject}
                onChange={(event) =>
                  setPendingEmail((prev) =>
                    prev
                      ? {
                          ...prev,
                          subject: event.target.value,
                        }
                      : prev,
                  )
                }
                placeholder="Saisissez un objet percutant"
              />
            </div>

            <div className="space-y-3">
              <Label>Segmentation visée</Label>
              <div className="flex flex-wrap gap-3">
                {EMAIL_SEGMENT_OPTIONS.map((segment) => {
                  const id = `segment-${segment.id}`;
                  return (
                    <div key={segment.id} className="flex items-start gap-2">
                      <Checkbox
                        id={id}
                        checked={selectedSegments.includes(segment.id)}
                        onCheckedChange={(checked) => {
                          const nextChecked = Boolean(checked);
                          setSelectedSegments((prev) => {
                            if (nextChecked) {
                              return Array.from(
                                new Set([...prev, segment.id]),
                              );
                            }
                            const next = prev.filter((id) => id !== segment.id);
                            return next.length > 0 ? next : DEFAULT_SEGMENTS;
                          });
                        }}
                      />
                      <div>
                        <Label htmlFor={id} className="text-sm font-medium">
                          {segment.label}
                        </Label>
                        {segment.description ? (
                          <p className="text-xs text-muted-foreground">
                            {segment.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Aperçu HTML</Label>
              <div
                className="rounded-md border bg-muted/40 p-4 text-sm"
                dangerouslySetInnerHTML={{
                  __html: pendingEmail.htmlPreview ||
                    buildHtmlPreview(pendingEmail.body),
                }}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={resetPendingEmail}
            >
              Réinitialiser
            </Button>
            <Button type="button" onClick={handleSaveEmail}>
              Enregistrer l'email
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      <Separator />

      {existingContents.length > 0 ? (
        <motion.div
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
          <h2 className="text-xl font-semibold">Campagnes enregistrées</h2>
          <div className="grid gap-4">
            {existingContents.map((item, index) => (
              <motion.div
                key={item.$id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {item.emailSubject || item.topic}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(item.emailSegments) &&
                      item.emailSegments.length > 0 ? (
                        item.emailSegments.map((segment: string) => (
                          <Badge key={segment} variant="secondary">
                            {EMAIL_SEGMENT_LABELS[segment] ?? segment}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline">Segmentation non définie</Badge>
                      )}
                    </div>
                    <div className="rounded-md border bg-muted/40 p-4 text-sm">
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            item.emailHtmlPreview ||
                            buildHtmlPreview(item.content ?? ""),
                        }}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(item.channels) && item.channels.length > 0 ? (
                          item.channels.map((channel: string) => (
                            <Badge key={channel} variant="secondary" className="capitalize">
                              {CHANNEL_LABELS[channel] ?? channel}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline">Canaux non définis</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant={getAutomationBadgeVariant(item.automationStatus)}>
                          {getAutomationStatusLabel(item.automationStatus)}
                        </Badge>
                        {item.scheduledAt ? (
                          <span>
                            Planifié pour {formatScheduleDisplay(item.scheduledAt)}
                          </span>
                        ) : item.automationEnabled ? (
                          <span>En attente de planification</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(item.content ?? "", item.$id, setCopiedId)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        {copiedId === item.$id ? "Copié !" : "Copier le texte"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleCopy(
                            item.emailHtmlPreview ||
                              buildHtmlPreview(item.content ?? ""),
                            item.$id,
                            setCopiedHtmlId,
                          )
                        }
                      >
                        <Code2 className="w-4 h-4 mr-1" />
                        {copiedHtmlId === item.$id
                          ? "HTML copié !"
                          : "Copier le HTML"}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={updatingContentId === item.$id}
                        onClick={() => handlePublishContent(item.$id)}
                      >
                        Publier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openScheduleDialog(item)}
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
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Aucune campagne enregistrée pour le moment. Générez un email pour
          commencer.
        </p>
      )}

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la campagne ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Tapez « supprimer » pour confirmer.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="supprimer"
            value={confirmationText}
            onChange={(event) => setConfirmationText(event.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={confirmationText.toLowerCase() !== "supprimer"}
              onClick={handleDeleteContent}
            >
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Programmer la campagne</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="schedule-date">Date et heure</Label>
            <Input
              id="schedule-date"
              type="datetime-local"
              value={scheduleDate}
              onChange={(event) => setScheduleDate(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetScheduleState}>
              Annuler
            </Button>
            <Button onClick={handleScheduleContent}>Programmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
