import { account, databases, databaseId, COLLECTIONS } from "./appwrite-config";
import { ID, Query } from "appwrite";

export interface User {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
  organizations: string[];
  currentOrganization?: string;
}

export interface Organization {
  $id: string;
  name: string;
  logo?: string;
  plan: "starter" | "pro" | "enterprise";
  ownerId: string;
  members: string[];
  createdAt: string;
}

export class AuthService {
  // Authentication
  async login(email: string, password: string) {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      return session;
    } catch (error) {
      throw error;
    }
  }

  async register(email: string, password: string, name: string) {
    try {
      const user = await account.create(ID.unique(), email, password, name);
      
      // Create user profile in database
      await this.createUserProfile(user.$id, {
        name: user.name,
        email: user.email,
        organizations: [],
      });

      // Auto login after registration
      await this.login(email, password);
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await account.deleteSession("current");
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const user = await account.get();
      const profile = await this.getUserProfile(user.$id);
      return { ...user, ...profile };
    } catch (error) {
      return null;
    }
  }

  // User Profile Management
  async createUserProfile(userId: string, data: Partial<User>) {
    try {
      return await databases.createDocument(
        databaseId,
        COLLECTIONS.USERS,
        userId,
        {
          ...data,
          createdAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      throw error;
    }
  }

  async getUserProfile(userId: string) {
    try {
      return await databases.getDocument(
        databaseId,
        COLLECTIONS.USERS,
        userId
      );
    } catch (error) {
      return null;
    }
  }

  async updateUserProfile(userId: string, data: Partial<User>) {
    try {
      return await databases.updateDocument(
        databaseId,
        COLLECTIONS.USERS,
        userId,
        data
      );
    } catch (error) {
      throw error;
    }
  }

  // Organization Management
  async createOrganization(name: string, plan: "starter" | "pro" | "enterprise" = "starter") {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error("User not authenticated");

      const organization = await databases.createDocument(
        databaseId,
        COLLECTIONS.ORGANIZATIONS,
        ID.unique(),
        {
          name,
          plan,
          ownerId: user.$id,
          members: [user.$id],
          createdAt: new Date().toISOString(),
        }
      );

      // Update user's organizations
      const userProfile = await this.getUserProfile(user.$id);
      await this.updateUserProfile(user.$id, {
        organizations: [...(userProfile?.organizations || []), organization.$id],
        currentOrganization: organization.$id,
      });

      return organization;
    } catch (error) {
      throw error;
    }
  }

  async getUserOrganizations(userId: string) {
    try {
      return await databases.listDocuments(
        databaseId,
        COLLECTIONS.ORGANIZATIONS,
        [Query.contains("members", userId)]
      );
    } catch (error) {
      throw error;
    }
  }

  async getOrganization(organizationId: string) {
    try {
      return await databases.getDocument(
        databaseId,
        COLLECTIONS.ORGANIZATIONS,
        organizationId
      );
    } catch (error) {
      throw error;
    }
  }

  async updateOrganization(organizationId: string, data: Partial<Organization>) {
    try {
      return await databases.updateDocument(
        databaseId,
        COLLECTIONS.ORGANIZATIONS,
        organizationId,
        data
      );
    } catch (error) {
      throw error;
    }
  }

  // Project Management
  async createProject(organizationId: string, name: string, description: string) {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error("User not authenticated");

      return await databases.createDocument(
        databaseId,
        COLLECTIONS.PROJECTS,
        ID.unique(),
        {
          name,
          description,
          organizationId,
          createdBy: user.$id,
          status: "active",
          createdAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      throw error;
    }
  }

  async getOrganizationProjects(organizationId: string) {
    try {
      return await databases.listDocuments(
        databaseId,
        COLLECTIONS.PROJECTS,
        [Query.equal("organizationId", organizationId)]
      );
    } catch (error) {
      throw error;
    }
  }

  // Content Management
  async saveContent(data: {
    organizationId: string;
    projectId?: string;
    topic: string;
    content: any;
    type: "social" | "article" | "email" | "carousel";
  }) {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error("User not authenticated");

      return await databases.createDocument(
        databaseId,
        COLLECTIONS.CONTENT,
        ID.unique(),
        {
          ...data,
          createdBy: user.$id,
          createdAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      throw error;
    }
  }

  async getOrganizationContent(organizationId: string) {
    try {
      return await databases.listDocuments(
        databaseId,
        COLLECTIONS.CONTENT,
        [Query.equal("organizationId", organizationId)]
      );
    } catch (error) {
      throw error;
    }
  }

  // Account settings
  async updateAccountName(newName: string) {
    try {
      await account.updateName(newName);
      const user = await this.getCurrentUser();
      if (user) {
        await this.updateUserProfile(user.$id, { name: newName });
      }
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(newPassword: string) {
    try {
      await account.updatePassword(newPassword);
    } catch (error) {
      throw error;
    }
  }

  // Team management
  async getOrganizationMembers(orgId: string) {
    try {
      const res = await databases.listDocuments(
        databaseId,
        COLLECTIONS.USERS,
        [Query.contains("organizations", orgId)]
      );
      return res.documents as User[];
    } catch (error) {
      throw error;
    }
  }

  async inviteMemberByEmail(orgId: string, email: string) {
    try {
      const users = await databases.listDocuments(
        databaseId,
        COLLECTIONS.USERS,
        [Query.equal("email", email)]
      );
      if (!users.documents.length) {
        throw new Error("Utilisateur introuvable");
      }
      const userDoc = users.documents[0] as User & { organizations: string[] };

      await this.updateUserProfile(userDoc.$id, {
        organizations: Array.from(new Set([...(userDoc.organizations || []), orgId])),
      });

      const org = await this.getOrganization(orgId);
      await this.updateOrganization(orgId, {
        members: Array.from(new Set([...(org.members || []), userDoc.$id])),
      });

      return userDoc;
    } catch (error) {
      throw error;
    }
  }

  async removeMemberFromOrganization(orgId: string, userId: string) {
    try {
      const user = await this.getUserProfile(userId);
      if (user) {
        await this.updateUserProfile(userId, {
          organizations: (user.organizations || []).filter((id: string) => id !== orgId),
        });
      }

      const org = await this.getOrganization(orgId);
      await this.updateOrganization(orgId, {
        members: (org.members || []).filter((id: string) => id !== userId),
      });
    } catch (error) {
      throw error;
    }
  }
}

export const authService = new AuthService();