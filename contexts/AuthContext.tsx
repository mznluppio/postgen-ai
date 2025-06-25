"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authService, User, Organization } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  organizations: Organization[];
  currentOrganization: Organization | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<void>;
  createOrganization: (
    name: string,
    plan?: "starter" | "pro" | "enterprise",
  ) => Promise<Organization>;
  updateCurrentOrganization: (data: Partial<Organization>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const orgsResponse = await authService.getUserOrganizations(
          currentUser.$id,
        );
        setOrganizations(orgsResponse.documents as Organization[]);

        // Set current organization
        if (currentUser.currentOrganization) {
          const currentOrg = orgsResponse.documents.find(
            (org: Organization) => org.$id === currentUser.currentOrganization,
          );
          setCurrentOrganization(
            currentOrg || orgsResponse.documents[0] || null,
          );
        } else if (orgsResponse.documents.length > 0) {
          setCurrentOrganization(orgsResponse.documents[0] as Organization);
        }
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
      setOrganizations([]);
      setCurrentOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await authService.login(email, password);
    await refreshUser();
  };

  const register = async (email: string, password: string, name: string) => {
    await authService.register(email, password, name);
    await refreshUser();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setOrganizations([]);
    setCurrentOrganization(null);
  };

  const switchOrganization = async (organizationId: string) => {
    if (!user) return;

    const org = organizations.find((o) => o.$id === organizationId);
    if (org) {
      setCurrentOrganization(org);
      await authService.updateUserProfile(user.$id, {
        currentOrganization: organizationId,
      });
    }
  };

  const createOrganization = async (
    name: string,
    plan: "starter" | "pro" | "enterprise" = "starter",
  ) => {
    const newOrg = await authService.createOrganization(name, plan);
    await refreshUser();
    return newOrg as Organization;
  };

  const updateCurrentOrganization = async (data: Partial<Organization>) => {
    if (!currentOrganization) return;

    try {
      const updatedOrg = await authService.updateOrganization(
        currentOrganization.$id,
        data,
      );
      setCurrentOrganization(updatedOrg);
      // Optionnel : rafraîchir la liste des organisations si nécessaire
      await refreshUser();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'organisation :", error);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        organizations,
        currentOrganization,
        loading,
        login,
        register,
        logout,
        switchOrganization,
        createOrganization,
        updateCurrentOrganization,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
