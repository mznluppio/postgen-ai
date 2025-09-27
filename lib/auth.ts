import {
  account,
  databases,
  databaseId,
  COLLECTIONS,
  teams,
} from "./appwrite-config";
import { ID, Query } from "appwrite";
import type { Models } from "appwrite";
import { getPlanSeatLimit, getPlanSeatPolicy } from "./plans";

export interface CommunicationPreferences {
  productUpdates: boolean;
  weeklySummary: boolean;
  securityAlerts: boolean;
}

export interface BillingContact {
  companyName?: string;
  contactName?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  vatNumber?: string;
  purchaseOrder?: string;
}

export interface PaymentMethodDetails {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault?: boolean;
}

export type InvoiceStatus = "paid" | "due" | "failed" | "void";

export interface InvoiceRecord {
  id: string;
  label: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issuedAt: string;
  downloadUrl?: string;
}

export interface SeatAddonSettings {
  quantity: number;
  currency: string;
  interval: "monthly" | "yearly";
  pricePerSeat?: number;
  description?: string;
  updatedAt?: string;
}

export interface BillingSettings {
  billingEmail?: string;
  contact?: BillingContact;
  paymentMethod?: PaymentMethodDetails | null;
  planRenewalDate?: string;
  invoices?: InvoiceRecord[];
  seatAddons?: SeatAddonSettings | null;
}

export interface User {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
  organizations: string[];
  currentOrganization?: string;
  language?: string;
  timezone?: string;
  communicationPreferences?: CommunicationPreferences;
}

export interface SupportCenterConfig {
  priorityEmail?: string;
  priorityPhone?: string;
  slackChannel?: string;
  slaTier?: string;
  slaDocumentUrl?: string;
  ticketPortalUrl?: string;
}

export interface ComplianceConfig {
  preferredDataRegion?: string;
  dataRegions?: string[];
  allowCustomRegion?: boolean;
  complianceArtifacts?: string[];
  requestContactEmail?: string;
}

export interface IdeaBacklogItem {
  id: string;
  topic: string;
  channel?: string;
  objective?: string;
  impact?: "high" | "medium" | "low";
  effort?: "high" | "medium" | "low";
  status?: "new" | "in-progress" | "approved" | "published";
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
}

export type EditorialCalendarStatus =
  | "draft"
  | "in-production"
  | "scheduled"
  | "published";

export interface EditorialCalendarEntry {
  id: string;
  title: string;
  channel: string;
  contentType?: string;
  owner?: string;
  status: EditorialCalendarStatus;
  publishDate: string;
  objective?: string;
  notes?: string;
  assets?: string[];
}

export type BrandGuidelineCategory =
  | "voice"
  | "visual"
  | "messaging"
  | "campaign"
  | "compliance"
  | "other";

export interface BrandGuideline {
  id: string;
  title: string;
  category: BrandGuidelineCategory;
  description: string;
  owner?: string;
  assets?: string[];
  toneKeywords?: string[];
  updatedAt: string;
}

export interface AudiencePersona {
  id: string;
  name: string;
  segment?: string;
  description?: string;
  pains?: string[];
  goals?: string[];
  preferredChannels?: string[];
  stage?: "awareness" | "consideration" | "decision" | "retention";
  notes?: string;
}

export interface AIModelConfig {
  id: string;
  name: string;
  provider: string;
  useCase: string;
  status: "active" | "paused";
  temperature?: number;
  maxTokens?: number;
  lastTrainedAt?: string;
  instructions?: string;
}

export interface Organization {
  $id: string;
  name: string;
  logo?: string;
  description?: string;
  plan: "starter" | "pro" | "enterprise";
  ownerId: string;
  members: string[];
  createdAt: string;
  teamId?: string;
  supportCenter?: SupportCenterConfig;
  compliance?: ComplianceConfig;
  ideaBacklog?: IdeaBacklogItem[];
  editorialCalendar?: EditorialCalendarEntry[];
  brandGuidelines?: BrandGuideline[];
  audiencePersonas?: AudiencePersona[];
  aiModelConfigs?: AIModelConfig[];
  billing?: BillingSettings;
}

export class AuthService {
  private getInviteRedirectUrl() {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/auth/callback`;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return `${baseUrl.replace(/\/$/, "")}/auth/callback`;
  }

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
          language: "fr",
          timezone: "Europe/Paris",
          communicationPreferences: {
            productUpdates: true,
            weeklySummary: true,
            securityAlerts: true,
          },
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
  async createOrganization(
    name: string,
    plan: "starter" | "pro" | "enterprise" = "starter",
  ) {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error("User not authenticated");

      const team = await teams.create(ID.unique(), name, ["owner"]);

      const seatPolicy = getPlanSeatPolicy(plan);

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
          teamId: team.$id,
          supportCenter: {
            priorityEmail: "",
            priorityPhone: "",
            slackChannel: "",
            slaTier: plan === "enterprise" ? "Enterprise" : "Standard",
            slaDocumentUrl: "",
            ticketPortalUrl: "",
          },
          compliance: {
            preferredDataRegion: "eu",
            dataRegions: ["eu"],
            allowCustomRegion: plan === "enterprise",
            complianceArtifacts: [],
            requestContactEmail: "",
          },
          billing: {
            billingEmail: user.email,
            contact: {
              companyName: name,
              contactName: user.name,
              email: user.email,
            },
            paymentMethod: null,
            planRenewalDate: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            invoices: [],
            seatAddons: seatPolicy.addOn
              ? {
                  quantity: 0,
                  currency: seatPolicy.addOn.currency,
                  interval: seatPolicy.addOn.interval,
                  pricePerSeat: seatPolicy.addOn.pricePerSeat,
                  description: seatPolicy.addOn.description,
                  updatedAt: new Date().toISOString(),
                }
              : null,
          },
          ideaBacklog: [],
          editorialCalendar: [],
          brandGuidelines: [],
          audiencePersonas: [],
          aiModelConfigs: [],
        }
      );

      try {
        const membership = await teams.createMembership(
          team.$id,
          ["owner"],
          user.email,
          undefined,
          undefined,
          this.getInviteRedirectUrl(),
          user.name,
        );

        if ((membership as any).secret) {
          await teams.updateMembershipStatus(
            team.$id,
            membership.$id,
            user.$id,
            (membership as any).secret,
          );
        }
      } catch (membershipError) {
        console.warn("Unable to auto-accept owner membership:", membershipError);
      }

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

  async ensureOrganizationTeam(
    organizationId: string,
    organizationName?: string,
  ): Promise<string> {
    const organization = (await this.getOrganization(organizationId)) as Organization;

    if (organization.teamId) {
      return organization.teamId;
    }

    const team = await teams.create(
      ID.unique(),
      organizationName || organization.name,
      ["owner"],
    );

    const updated = await this.updateOrganization(organizationId, {
      teamId: team.$id,
    });

    const currentUser = await this.getCurrentUser();
    if (currentUser) {
      try {
        const membership = await teams.createMembership(
          team.$id,
          ["owner"],
          currentUser.email,
          undefined,
          undefined,
          this.getInviteRedirectUrl(),
          currentUser.name,
        );

        if ((membership as any).secret) {
          await teams.updateMembershipStatus(
            team.$id,
            membership.$id,
            currentUser.$id,
            (membership as any).secret,
          );
        }
      } catch (membershipError) {
        console.warn(
          "Unable to auto-accept membership while ensuring organization team:",
          membershipError,
        );
      }
    }

    return (updated as Organization).teamId || team.$id;
  }

  async listTeamMembers(teamId: string) {
    return teams.listMemberships(teamId);
  }

  async inviteTeamMember(
    teamId: string,
    email: string,
    role: string = "member",
    name?: string,
  ): Promise<Models.Membership> {
    if (!email) {
      throw new Error("Email requis pour inviter un membre");
    }

    const membership = await teams.createMembership(
      teamId,
      [role],
      email,
      undefined,
      undefined,
      this.getInviteRedirectUrl(),
      name,
    );

    return membership;
  }

  async removeTeamMember(teamId: string, membershipId: string) {
    return teams.deleteMembership(teamId, membershipId);
  }

  async syncOrganizationMembersFromTeam(
    organizationId: string,
    teamId: string,
  ) {
    try {
      const { memberships } = await this.listTeamMembers(teamId);
      const memberIds = memberships
        .filter((membership) => membership.confirm)
        .map((membership) => membership.userId)
        .filter(Boolean);

      const organization = (await this.getOrganization(
        organizationId,
      )) as Organization;
      const limit = getPlanSeatLimit(
        organization?.plan || "starter",
        organization?.billing?.seatAddons?.quantity ?? 0,
      );

      await this.updateOrganization(organizationId, {
        members: memberIds,
      });

      return { memberIds, limit };
    } catch (error) {
      console.warn("Unable to sync organization members:", error);
      return null;
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
    status?: "draft" | "scheduled" | "published";
    channels?: string[];
    scheduledAt?: string | null;
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
          status: data.status ?? "draft",
          channels: data.channels ?? [],
          scheduledAt: data.scheduledAt ?? null,
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
}

export const authService = new AuthService();