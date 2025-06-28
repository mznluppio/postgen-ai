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
import { databases } from "@/lib/appwrite-config";
import { ID, Query } from "appwrite";
import ContentGenerator from "@/components/dashboard/ContentGenerator";
import {
  BookDashed,
  Briefcase,
  Copy,
  RefreshCcw,
  Trash2,
  Download,
  Eye,
  ExternalLink,
  Code,
  Image,
  FileText,
  Monitor,
  Smartphone,
  ImageIcon,
} from "lucide-react";
import { motion } from "framer-motion";

export default function VisualContentPage() {
  const { currentOrganization, user } = useAuth();
  const { type, projectId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [existingContents, setExistingContents] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<any>(null);
  const [confirmationText, setConfirmationText] = useState("");
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const [exportingPng, setExportingPng] = useState<string | null>(null);

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

  const handleSaveContent = async (content: string) => {
    if (!currentOrganization || !projectId || !user) return;
    const topic = content.slice(0, 50);
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

  // Fonction pour exporter le contenu HTML
  const handleExportHTML = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Fonction pour exporter en PNG
  const handleExportPNG = async (
    content: string,
    filename: string,
    contentId: string,
  ) => {
    setExportingPng(contentId);
    try {
      // Créer un iframe temporaire pour capturer le contenu
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.left = "-9999px";
      iframe.style.width = "1080px"; // Largeur fixe pour la capture
      iframe.style.height = "1080px"; // Hauteur fixe pour la capture
      iframe.style.border = "none";

      document.body.appendChild(iframe);

      // Écrire le contenu dans l'iframe
      iframe.contentDocument?.open();
      iframe.contentDocument?.write(content);
      iframe.contentDocument?.close();

      // Attendre que le contenu soit chargé
      await new Promise((resolve) => {
        iframe.onload = resolve;
        setTimeout(resolve, 2000); // Fallback timeout
      });

      // Utiliser html2canvas pour capturer l'iframe
      const html2canvas = await import("html2canvas");

      if (iframe.contentDocument?.body) {
        const canvas = await html2canvas.default(iframe.contentDocument.body, {
          width: 1080,
          height: 1080,
          scale: 1,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
        });

        // Créer un lien de téléchargement
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${filename}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }, "image/png");
      }

      // Nettoyer
      document.body.removeChild(iframe);
    } catch (error) {
      console.error("Erreur lors de l'export PNG:", error);
      alert("Erreur lors de l'export PNG. Veuillez réessayer.");
    } finally {
      setExportingPng(null);
    }
  };

  // Fonction pour ouvrir en nouvelle fenêtre
  const handleOpenNewWindow = (content: string) => {
    const newWindow = window.open("", "_blank", "width=1200,height=800");
    if (newWindow) {
      newWindow.document.write(content);
      newWindow.document.close();
    }
  };

  // Fonction pour prévisualiser le contenu
  const handlePreview = (content: string) => {
    setPreviewContent(content);
    setShowPreviewModal(true);
  };

  // Détecter le type de contenu
  const getContentType = (content: string, type: string) => {
    if (content.includes("<!DOCTYPE html>") || content.includes("<html")) {
      return "html";
    }
    if (content.includes("##") || content.includes("###")) {
      return "markdown";
    }
    return "text";
  };

  // Extraire le titre du contenu HTML
  const extractHTMLTitle = (content: string) => {
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    if (titleMatch) return titleMatch[1];

    const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match) return h1Match[1].replace(/<[^>]*>/g, "");

    return "Contenu HTML";
  };

  // Obtenir les informations du contenu
  const getContentInfo = (item: any) => {
    const contentType = getContentType(item.content, item.type);
    const isCarousel = [
      "carousel",
      "carousels",
      "carrousel",
      "carrousels",
    ].includes(item.type?.toLowerCase());

    let title = item.topic;
    let description = "";
    let icon = <FileText className="w-4 h-4" />;

    if (contentType === "html") {
      title = extractHTMLTitle(item.content);
      if (isCarousel) {
        description = "Slides exportables individuellement";
        icon = <Image className="w-4 h-4" />;
      } else {
        description = "Contenu HTML interactif";
        icon = <Code className="w-4 h-4" />;
      }
    }

    return { title, description, icon, contentType, isCarousel };
  };

  // FONCTION AMÉLIORÉE : renderContentPreview
  const renderContentPreview = (item: any) => {
    const { title, description, icon, contentType, isCarousel } =
      getContentInfo(item);

    if (contentType === "html") {
      return (
        <div className="space-y-4">
          {/* En-tête du contenu */}
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
            {icon}
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{title}</h4>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <div className="text-xs bg-white px-2 py-1 rounded-full border">
              HTML
            </div>
          </div>

          {/* Aperçu miniature - TOUJOURS AFFICHÉ */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50">
            <div className="bg-white px-3 py-2 text-xs text-gray-600 border-b border-gray-200 flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Aperçu
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(item.content.length / 1024)}KB
              </span>
            </div>
            <div className="relative">
              <iframe
                srcDoc={item.content}
                className="w-full h-48 border-0 bg-white"
                title={`Aperçu ${item.type}`}
                sandbox="allow-scripts allow-same-origin"
              />
              <div
                className="absolute inset-0 cursor-pointer bg-transparent hover:bg-black/5 transition-colors"
                onClick={() => handlePreview(item.content)}
                title="Cliquer pour agrandir l'aperçu"
              />
            </div>
          </div>

          {/* Actions spécialisées */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreview(item.content)}
              className="text-xs h-8"
            >
              <Eye className="w-3 h-3 mr-1" />
              Aperçu
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenNewWindow(item.content)}
              className="text-xs h-8"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Ouvrir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleExportHTML(
                  item.content,
                  `${item.type}-${item.topic.replace(/\s+/g, "-")}-${Date.now()}`,
                )
              }
              className="text-xs h-8"
            >
              <Download className="w-3 h-3 mr-1" />
              HTML
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleExportPNG(
                  item.content,
                  `${item.type}-${item.topic.replace(/\s+/g, "-")}-${Date.now()}`,
                  item.$id,
                )
              }
              disabled={exportingPng === item.$id}
              className="text-xs h-8"
            >
              <ImageIcon className="w-3 h-3 mr-1" />
              {exportingPng === item.$id ? "Export..." : "PNG"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(item.content, item.$id)}
              className="text-xs h-8"
            >
              <Copy className="w-3 h-3 mr-1" />
              {copiedId === item.$id ? "Copié !" : "Code"}
            </Button>
          </div>

          {/* Instructions spéciales pour carousel */}
          {isCarousel && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="text-amber-600 mt-0.5">💡</div>
                <div className="text-xs">
                  <p className="font-medium text-amber-900 mb-1">
                    Export des slides :
                  </p>
                  <p className="text-amber-800">
                    Utilisez le bouton PNG pour exporter directement en image
                    (1080x1080px) ou ouvrez en plein écran pour capturer
                    individuellement.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Code source (collapsible) */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
              <span className="transform transition-transform group-open:rotate-90">
                ▶
              </span>
              <Code className="w-4 h-4" />
              Code source HTML
            </summary>
            <div className="mt-3 border rounded-lg overflow-hidden">
              <div className="bg-gray-800 text-gray-200 px-3 py-2 text-xs font-mono flex justify-between items-center">
                <span>{item.type.toLowerCase()}.html</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(item.content, `${item.$id}-code`)}
                  className="h-6 px-2 text-xs text-gray-300 hover:text-white"
                >
                  {copiedId === `${item.$id}-code` ? "Copié!" : "Copier"}
                </Button>
              </div>
              <pre className="p-3 bg-gray-50 text-xs overflow-x-auto max-h-40 text-gray-800">
                <code>{item.content}</code>
              </pre>
            </div>
          </details>
        </div>
      );
    }

    // Affichage pour contenu markdown
    if (contentType === "markdown") {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookDashed className="w-4 h-4" />
            Contenu Markdown
          </div>
          <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-normal">
              {item.content.length > 300
                ? `${item.content.substring(0, 300)}...`
                : item.content}
            </pre>
          </div>
        </div>
      );
    }

    // Affichage pour texte simple
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="w-4 h-4" />
          Contenu texte
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="whitespace-pre-line text-sm leading-relaxed">
            {item.content.length > 300
              ? `${item.content.substring(0, 300)}...`
              : item.content}
          </p>
        </div>
      </div>
    );
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
          Générateur de contenu <span className="capitalize">{type}</span>
        </h1>
        {project?.name && (
          <div className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground w-fit">
            <Briefcase className="w-4 h-4" />
            {project.name}
          </div>
        )}
        <p className="text-muted-foreground text-sm">
          Créez, prévisualisez et exportez facilement vos contenus visuels.
        </p>
      </motion.div>

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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Contenus générés</h2>
            <div className="text-sm text-muted-foreground">
              {existingContents.length} contenu
              {existingContents.length > 1 ? "s" : ""}
            </div>
          </div>

          <div className="grid gap-6">
            {existingContents.map((item, index) => (
              <motion.div
                key={item.$id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Card className="transition-all hover:shadow-lg border-0 shadow-md">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">
                        {getContentInfo(item).title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {getContentInfo(item).icon}
                        <span className="capitalize">{item.type}</span>
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      Créé le{" "}
                      {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {renderContentPreview(item)}
                  </CardContent>

                  <CardFooter className="pt-4 border-t bg-gray-50/50">
                    <div className="flex flex-wrap gap-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(item.content, item.$id)}
                        className="flex-1 min-w-[100px]"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        {copiedId === item.$id ? "Copié !" : "Copier tout"}
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setContentToDelete(item);
                          setShowDeleteModal(true);
                        }}
                        className="flex-1 min-w-[100px]"
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
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Image className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold">Aucun contenu généré</h3>
          <p className="text-sm mt-1">
            Utilisez le générateur ci-dessus pour créer votre premier contenu{" "}
            {type}.
          </p>
        </div>
      )}

      {/* Modal de suppression */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cette action est irréversible. Le contenu sera définitivement
              supprimé.
            </p>
            <p className="text-sm">
              Pour confirmer, tapez <strong>supprimer</strong> ci-dessous :
            </p>
            <Input
              placeholder="Tapez 'supprimer'"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
            />
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setConfirmationText("");
                setContentToDelete(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteContent}
              disabled={confirmationText.toLowerCase() !== "supprimer"}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal d'aperçu amélioré */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Aperçu du contenu</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={previewDevice === "desktop" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewDevice("desktop")}
                >
                  <Monitor className="w-4 h-4 mr-1" />
                  Desktop
                </Button>
                <Button
                  variant={previewDevice === "mobile" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewDevice("mobile")}
                >
                  <Smartphone className="w-4 h-4 mr-1" />
                  Mobile
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto bg-gray-100 p-4 rounded-lg">
            {previewContent && (
              <div
                className={`mx-auto transition-all duration-300 ${
                  previewDevice === "mobile" ? "max-w-sm" : "w-full"
                }`}
              >
                <iframe
                  srcDoc={previewContent}
                  className={`w-full border-2 border-gray-300 rounded-lg shadow-lg bg-white ${
                    previewDevice === "mobile" ? "h-[600px]" : "h-[70vh]"
                  }`}
                  title="Aperçu du contenu HTML"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreviewModal(false)}
            >
              Fermer
            </Button>
            {previewContent && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleOpenNewWindow(previewContent)}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Nouvelle fenêtre
                </Button>
                <Button
                  onClick={() =>
                    handleExportHTML(previewContent, `export-${Date.now()}`)
                  }
                >
                  <Download className="w-4 h-4 mr-1" />
                  Télécharger HTML
                </Button>
                <Button
                  onClick={() =>
                    handleExportPNG(
                      previewContent,
                      `export-${Date.now()}`,
                      "preview",
                    )
                  }
                  disabled={exportingPng === "preview"}
                >
                  <ImageIcon className="w-4 h-4 mr-1" />
                  {exportingPng === "preview" ? "Export PNG..." : "Export PNG"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
