"use client";

import { useEffect, useState } from "react";
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
import {
  CHANNEL_LABELS,
  formatScheduleDisplay,
  getAutomationBadgeVariant,
  getAutomationStatusLabel,
} from "@/lib/content-automation";
import { Briefcase, Copy, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SocialContentPage() {
  const { currentOrganization, user } = useAuth();
  const { type, projectId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [existingContents, setExistingContents] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<any>(null);
  const [confirmationText, setConfirmationText] = useState("");
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
      },
    );
    setExistingContents((prev) => [doc, ...prev]);
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
    <motion.div
      className="flex flex-col gap-6 p-4 sm:p-6 max-w-4xl w-full mx-auto"
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
        type={type as string}
        title={`Générateur de contenu ${type}`}
        description={fullPrompt}
        placeholder="Ex: marketing digital, bien-être, IA..."
        onGenerated={handleSaveContent}
      />
      <Separator />

      {existingContents.length > 0 ? (
        <motion.div
          className="space-y-4"
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
                    <CardTitle className="text-base">{item.topic}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line text-sm">
                      {item.content}
                    </p>
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
                        onClick={() => handleCopy(item.content, item.$id)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        {copiedId === item.$id ? "Copié !" : "Copier"}
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
    </motion.div>
  );
}
