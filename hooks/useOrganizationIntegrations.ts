"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { Organization } from "@/lib/auth";
import {
  IntegrationDocument,
  integrationService,
} from "@/lib/integrations";

export interface UseOrganizationIntegrationsResult {
  integrations: IntegrationDocument[];
  loading: boolean;
  error: string | null;
  activeCount: number;
  connectIntegration: (
    integrationId: string,
    token: string,
    metadata?: Record<string, unknown>,
  ) => Promise<IntegrationDocument>;
  disconnectIntegration: (integrationId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useOrganizationIntegrations(
  organization?: Organization | null,
): UseOrganizationIntegrationsResult {
  const [integrations, setIntegrations] = useState<IntegrationDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegrations = useCallback(async () => {
    if (!organization) {
      setIntegrations([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const documents = await integrationService.listOrganizationIntegrations(
        organization.$id,
      );
      setIntegrations(documents);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const connect = useCallback(
    async (
      integrationId: string,
      token: string,
      metadata?: Record<string, unknown>,
    ) => {
      if (!organization) {
        throw new Error("Organisation introuvable");
      }

      const document = await integrationService.connectIntegration(
        organization.$id,
        integrationId,
        { token, metadata: metadata ?? {} },
      );

      setIntegrations((prev) => {
        const others = prev.filter((item) => item.integration !== integrationId);
        return [...others, document];
      });

      return document;
    },
    [organization],
  );

  const disconnect = useCallback(
    async (integrationId: string) => {
      if (!organization) {
        throw new Error("Organisation introuvable");
      }

      const existing = integrations.find(
        (item) => item.integration === integrationId,
      );

      if (!existing) {
        return;
      }

      await integrationService.disconnectIntegration(existing.$id);

      setIntegrations((prev) =>
        prev.filter((item) => item.integration !== integrationId),
      );
    },
    [integrations, organization],
  );

  const activeCount = useMemo(
    () => integrations.filter((item) => item.status === "connected").length,
    [integrations],
  );

  return {
    integrations,
    loading,
    error,
    activeCount,
    connectIntegration: connect,
    disconnectIntegration: disconnect,
    refresh: fetchIntegrations,
  };
}
