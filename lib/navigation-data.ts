import {
  BarChart3,
  Bot,
  Briefcase,
  Building2,
  Calendar,
  FileText,
  FolderOpen,
  Home,
  ImageIcon,
  Lightbulb,
  Mail,
  MessageSquare,
  Palette,
  Settings,
  Users,
  Zap,
} from "lucide-react";

export interface Organization {
  id: string;
  name: string;
  logo: string;
  plan: "Starter" | "Pro" | "Enterprise";
  role: "Owner" | "Admin" | "Member";
}

export interface Project {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  createdAt: string;
  status: "Active" | "Paused" | "Completed";
}

export interface NavigationItem {
  title: string;
  url: string;
  icon: any;
  badge?: string;
  isActive?: boolean;
  items?: NavigationItem[];
}

export const organizations: Organization[] = [
  {
    id: "1",
    name: "Postgen AI",
    logo: "/placeholder.svg?height=32&width=32",
    plan: "Enterprise",
    role: "Owner",
  },
  {
    id: "2",
    name: "Marketing Agency Pro",
    logo: "/placeholder.svg?height=32&width=32",
    plan: "Pro",
    role: "Admin",
  },
  {
    id: "3",
    name: "E-commerce Startup",
    logo: "/placeholder.svg?height=32&width=32",
    plan: "Starter",
    role: "Member",
  },
];

export const projects: Project[] = [
  {
    id: "1",
    name: "Q1 Product Launch",
    description: "Complete marketing campaign for new product",
    organizationId: "1",
    createdAt: "2024-01-15",
    status: "Active",
  },
  {
    id: "2",
    name: "Brand Awareness Campaign",
    description: "Social media content for brand visibility",
    organizationId: "1",
    createdAt: "2024-01-10",
    status: "Active",
  },
];

export const mainNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Quick Generate",
    url: "/generate",
    icon: Zap,
    badge: "AI",
  },
  {
    title: "Projects",
    url: "/dashboard/projects",
    icon: Briefcase,
  },
  {
    title: "Content Library",
    url: "/library",
    icon: FolderOpen,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
];

export const contentCreation: NavigationItem[] = [
  {
    title: "Drafts",
    url: "/dashboard/content/drafts",
    icon: FolderOpen,
  },
  {
    title: "Social Media",
    url: "/dashboard/content/social",
    icon: MessageSquare,
    items: [
      {
        title: "LinkedIn Posts",
        url: "/dashboard/content/social/linkedin",
        icon: MessageSquare,
      },
      {
        title: "Twitter/X Posts",
        url: "/dashboard/content/social/twitter",
        icon: MessageSquare,
      },
      {
        title: "Facebook Posts",
        url: "/dashboard/content/social/facebook",
        icon: MessageSquare,
      },
      {
        title: "Instagram Posts",
        url: "/dashboard/content/social/instagram",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "Visual Content",
    url: "/dashboard/content/visual",
    icon: ImageIcon,
    items: [
      {
        title: "Carousels",
        url: "/dashboard/content/visual/carousels",
        icon: ImageIcon,
      },
      {
        title: "Infographics",
        url: "/dashboard/content/visual/infographics",
        icon: ImageIcon,
      },
      {
        title: "Stories",
        url: "/dashboard/content/visual/stories",
        icon: ImageIcon,
      },
      {
        title: "Thumbnails",
        url: "/dashboard/content/visual/thumbnails",
        icon: ImageIcon,
      },
    ],
  },
  {
    title: "Long-form Content",
    url: "/dashboard/content/articles",
    icon: FileText,
    items: [
      {
        title: "Blog Articles",
        url: "/dashboard/content/articles/blog",
        icon: FileText,
      },
      {
        title: "LinkedIn Articles",
        url: "/dashboard/content/articles/linkedin",
        icon: FileText,
      },
      {
        title: "Case Studies",
        url: "/dashboard/content/articles/case-studies",
        icon: FileText,
      },
      {
        title: "White Papers",
        url: "/dashboard/content/articles/whitepapers",
        icon: FileText,
      },
    ],
  },
  {
    title: "Email Marketing",
    url: "/dashboard/content/email",
    icon: Mail,
    items: [
      { title: "Email Campaigns", url: "/content/email/campaigns", icon: Mail },
      { title: "Newsletter", url: "/content/email/newsletter", icon: Mail },
      { title: "Drip Sequences", url: "/content/email/sequences", icon: Mail },
      { title: "Templates", url: "/content/email/templates", icon: Mail },
    ],
  },
];

export const managementTools: NavigationItem[] = [
  {
    title: "Content Calendar",
    url: "/tools/calendar",
    icon: Calendar,
  },
  {
    title: "Brand Guidelines",
    url: "/tools/brand",
    icon: Palette,
  },
  {
    title: "Target Audiences",
    url: "/tools/audiences",
    icon: Users,
  },
  {
    title: "AI Models",
    url: "/tools/ai-models",
    icon: Bot,
  },
  {
    title: "Content Ideas",
    url: "/tools/ideas",
    icon: Lightbulb,
  },
];

export const organizationSettings: NavigationItem[] = [
  {
    title: "Organization Settings",
    url: "/dashboard/settings/organization",
    icon: Building2,
  },
  {
    title: "Team Management",
    url: "/dashboard/settings/team",
    icon: Users,
  },
  {
    title: "Integrations",
    url: "/dashboard/settings/integrations",
    icon: Settings,
  },
];
