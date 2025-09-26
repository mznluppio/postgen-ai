import { ID, Query, type Models } from "appwrite";

import {
  COLLECTIONS,
  databaseId,
  databases,
} from "@/lib/appwrite-config";

export type IntegrationStatus = "connected" | "error";

export interface IntegrationDocument extends Models.Document {
  organizationId: string;
  integration: string;
  status: IntegrationStatus;
  token?: string;
  metadata?: Record<string, unknown> | null;
  connectedAt?: string;
}

interface ConnectIntegrationPayload {
  token: string;
  metadata?: Record<string, unknown>;
  status?: IntegrationStatus;
}

function ensureCollectionConfigured() {
  if (!COLLECTIONS.INTEGRATIONS) {
    throw new Error(
      "La collection Appwrite des intégrations n'est pas configurée.",
    );
  }
}

export const integrationService = {
  async listOrganizationIntegrations(
    organizationId: string,
  ): Promise<IntegrationDocument[]> {
    if (!organizationId) {
      return [];
    }

    ensureCollectionConfigured();

    const response = await databases.listDocuments(
      databaseId,
      COLLECTIONS.INTEGRATIONS,
      [Query.equal("organizationId", organizationId)],
    );

    return response.documents as IntegrationDocument[];
  },

  async connectIntegration(
    organizationId: string,
    integrationId: string,
    { token, metadata = {}, status = "connected" }: ConnectIntegrationPayload,
  ): Promise<IntegrationDocument> {
    if (!organizationId) {
      throw new Error("Identifiant d'organisation manquant");
    }

    if (!integrationId) {
      throw new Error("Identifiant d'intégration manquant");
    }

    if (!token) {
      throw new Error("Token d'accès requis pour connecter l'intégration");
    }

    ensureCollectionConfigured();

    const now = new Date().toISOString();

    const existing = await databases.listDocuments(
      databaseId,
      COLLECTIONS.INTEGRATIONS,
      [
        Query.equal("organizationId", organizationId),
        Query.equal("integration", integrationId),
      ],
    );

    if (existing.documents.length > 0) {
      const document = existing.documents[0] as IntegrationDocument;

      return (await databases.updateDocument(
        databaseId,
        COLLECTIONS.INTEGRATIONS,
        document.$id,
        {
          organizationId,
          integration: integrationId,
          status,
          token,
          metadata,
          connectedAt: now,
        },
      )) as IntegrationDocument;
    }

    return (await databases.createDocument(
      databaseId,
      COLLECTIONS.INTEGRATIONS,
      ID.unique(),
      {
        organizationId,
        integration: integrationId,
        status,
        token,
        metadata,
        connectedAt: now,
      },
    )) as IntegrationDocument;
  },

  async disconnectIntegration(documentId: string): Promise<void> {
    if (!documentId) {
      throw new Error("Identifiant de connexion manquant");
    }

    ensureCollectionConfigured();

    await databases.deleteDocument(
      databaseId,
      COLLECTIONS.INTEGRATIONS,
      documentId,
    );
  },
};
