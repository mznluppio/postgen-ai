import { databases, databaseId, COLLECTIONS } from "./appwrite-config";
import { ID, Query } from "appwrite";

export type Plan = "starter" | "pro" | "enterprise";

export const planLimits: Record<Plan, number> = {
  starter: 20,
  pro: 200,
  enterprise: Infinity as unknown as number,
};

interface UsageDoc {
  $id: string;
  organizationId: string;
  month: string;
  count: number;
}

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

export async function getUsage(orgId: string): Promise<UsageDoc | null> {
  try {
    const docs = await databases.listDocuments(databaseId, COLLECTIONS.USAGE, [
      Query.equal("organizationId", orgId),
      Query.equal("month", getCurrentMonth()),
    ]);
    return (docs.documents[0] as UsageDoc) || null;
  } catch (e) {
    return null;
  }
}

export async function incrementUsage(orgId: string) {
  const existing = await getUsage(orgId);
  if (existing) {
    await databases.updateDocument(databaseId, COLLECTIONS.USAGE, existing.$id, {
      count: existing.count + 1,
    });
  } else {
    await databases.createDocument(databaseId, COLLECTIONS.USAGE, ID.unique(), {
      organizationId: orgId,
      month: getCurrentMonth(),
      count: 1,
    });
  }
}

export async function checkLimit(plan: Plan, orgId: string) {
  const limit = planLimits[plan];
  if (!isFinite(limit)) return true;
  const usage = await getUsage(orgId);
  return (usage?.count || 0) < limit;
}
