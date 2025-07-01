"use client";

import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { OrganizationSwitcher } from "@/components/dashboard/OrganizationSwitcher";
import { UserMenu } from "./user-menu";
import { NavigationSection } from "./navigation-section";
import {
  mainNavigation,
  contentCreation,
  managementTools,
  organizationSettings,
  accountNavigation,
} from "@/lib/navigation-data";

export function AppSidebar() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <OrganizationSwitcher />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationSection items={mainNavigation} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content Creation */}
        <SidebarGroup>
          <SidebarGroupLabel>Création de contenu</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationSection
              items={contentCreation}
              defaultOpen={["Social Media"]}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>Outils & Gestion</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationSection items={managementTools} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Organization Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Organisation</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationSection items={organizationSettings} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account */}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserMenu user={user} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
