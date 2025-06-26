import { Storage } from "appwrite";
import { client } from "@/lib/appwrite-config";

const storage = new Storage(client);

export const getLogoUrl = (logoId?: string): string | undefined => {
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_ORGSLOGO_ID;
  if (!bucketId || !logoId) return undefined;

  try {
    return storage.getFileView(bucketId, logoId);
  } catch (err) {
    console.error("Erreur lors de la génération de l'URL du logo :", err);
    return undefined;
  }
};
