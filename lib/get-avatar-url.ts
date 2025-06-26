import { Storage } from "appwrite";
import { client } from "@/lib/appwrite-config";

const storage = new Storage(client);

export const getAvatarUrl = (fileId?: string): string | undefined => {
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_USERAVATARS_ID;
  if (!bucketId || !fileId) return undefined;

  try {
    return storage.getFileView(bucketId, fileId);
  } catch {
    return undefined;
  }
};
