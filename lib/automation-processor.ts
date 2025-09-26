import { databases } from "@/lib/appwrite-config";
import { Query } from "appwrite";

interface ProcessScheduledResult {
  processed: number;
  failed: number;
  documentIds: string[];
  errors: string[];
}

export async function processScheduledContent(): Promise<ProcessScheduledResult> {
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const collectionId = process.env.NEXT_PUBLIC_APPWRITE_CONTENTS_COLLECTION_ID;

  if (!databaseId || !collectionId) {
    return {
      processed: 0,
      failed: 0,
      documentIds: [],
      errors: [
        "Configuration Appwrite manquante : vérifiez les variables d'environnement de base de données et de collection.",
      ],
    };
  }

  const nowIso = new Date().toISOString();
  const processedIds: string[] = [];
  const errors: string[] = [];
  let failed = 0;

  try {
    const scheduled = await databases.listDocuments(databaseId, collectionId, [
      Query.equal("automationEnabled", true),
      Query.lessEqual("scheduledAt", nowIso),
    ]);

    for (const doc of scheduled.documents) {
      try {
        await databases.updateDocument(databaseId, collectionId, doc.$id, {
          automationStatus: "processing",
          automationLastRunAt: nowIso,
        });

        // Stubbed delivery : en environnement réel, appeler ici les APIs LinkedIn, Instagram, email.
        await databases.updateDocument(databaseId, collectionId, doc.$id, {
          automationStatus: "posted",
          automationLastRunAt: nowIso,
          automationResult:
            "Publication simulée : le connecteur exécutera la diffusion lors de l'intégration.",
        });

        processedIds.push(doc.$id);
      } catch (error: any) {
        failed += 1;
        const message =
          error?.message ||
          `Erreur inconnue lors du traitement du document ${doc.$id}`;
        errors.push(message);
        await databases.updateDocument(databaseId, collectionId, doc.$id, {
          automationStatus: "failed",
          automationLastRunAt: nowIso,
          automationResult: message,
        });
      }
    }
  } catch (error: any) {
    errors.push(
      error?.message ||
        "Impossible de récupérer les contenus planifiés pour l'automatisation.",
    );
  }

  return {
    processed: processedIds.length,
    failed,
    documentIds: processedIds,
    errors,
  };
}
