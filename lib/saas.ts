import { databases, databaseId, COLLECTIONS } from "./appwrite-config";
import { ID, Query } from "appwrite";

export type Plan = "starter" | "pro" | "enterprise";

export const planLimits: Record<Plan, number> = {
  starter: 20,
  pro: 200,
  enterprise: Infinity as unknown as number,
};

export async function getPlan(orgId: string): Promise<Plan> {
  try {
    const doc = await databases.getDocument(
      databaseId,
      COLLECTIONS.ORGANIZATIONS,
      orgId,
    );
    return (doc.plan as Plan) || "starter";
  } catch (e) {
    return "starter";
  }
}

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

export async function checkLimit(orgId: string, plan?: Plan) {
  const effectivePlan = plan || (await getPlan(orgId));
  const limit = planLimits[effectivePlan];
  if (!isFinite(limit)) return true;
  const usage = await getUsage(orgId);
  return (usage?.count || 0) < limit;
}

