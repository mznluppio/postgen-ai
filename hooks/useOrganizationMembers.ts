"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Models } from "appwrite";

import { authService, Organization } from "@/lib/auth";
import { getPlanLimit } from "@/lib/plans";

type Options = {
  onTeamResolved?: (teamId: string) => void | Promise<void>;
};

export function useOrganizationMembers(
  organization?: Organization | null,
  options?: Options,
) {
  const [teamId, setTeamId] = useState<string | null>(organization?.teamId ?? null);
  const [members, setMembers] = useState<Models.Membership[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTeamId(organization?.teamId ?? null);
  }, [organization?.teamId]);

  const ensureTeam = useCallback(async () => {
    if (!organization) {
      throw new Error("Organisation introuvable");
    }

    if (teamId) {
      return teamId;
    }

    const createdTeamId = await authService.ensureOrganizationTeam(
      organization.$id,
      organization.name,
    );
    setTeamId(createdTeamId);
    await options?.onTeamResolved?.(createdTeamId);
    return createdTeamId;
  }, [organization, options, teamId]);

  const fetchMembers = useCallback(async () => {
    if (!organization) {
      setMembers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resolvedTeamId = await ensureTeam();
      const { memberships } = await authService.listTeamMembers(resolvedTeamId);
      setMembers(memberships);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [ensureTeam, organization]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const limit = useMemo(() => {
    if (!organization) return null;
    return getPlanLimit(organization.plan);
  }, [organization]);

  const isAtLimit = useMemo(() => {
    if (limit === null) {
      return false;
    }

    return members.length >= limit;
  }, [limit, members.length]);

  const inviteMember = useCallback(
    async (email: string, role: string = "member", name?: string) => {
      if (!organization) {
        throw new Error("Organisation introuvable");
      }

      if (!email) {
        throw new Error("Email requis");
      }

      if (limit !== null && members.length >= limit) {
        throw new Error("La limite de membres du plan est atteinte");
      }

      const resolvedTeamId = await ensureTeam();
      const membership = await authService.inviteTeamMember(
        resolvedTeamId,
        email,
        role,
        name,
      );

      setMembers((prev) => {
        const exists = prev.some((member) => member.$id === membership.$id);
        if (exists) {
          return prev;
        }
        return [...prev, membership];
      });

      return membership;
    },
    [ensureTeam, limit, members.length, organization],
  );

  const removeMember = useCallback(
    async (membershipId: string) => {
      if (!teamId) {
        throw new Error("Aucune équipe associée");
      }

      await authService.removeTeamMember(teamId, membershipId);
      setMembers((prev) => prev.filter((member) => member.$id !== membershipId));
    },
    [teamId],
  );

  return {
    teamId,
    members,
    loading,
    error,
    limit,
    isAtLimit,
    inviteMember,
    removeMember,
    refresh: fetchMembers,
  };
}
