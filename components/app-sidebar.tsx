"use client"

import * as React from "react"

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
} from "@/components/ui/sidebar"
import { OrganizationSwitcher } from "./organization-switcher"
import { ProjectSwitcher } from "./project-switcher"
import { UserMenu } from "./user-menu"
import { NavigationSection } from "./navigation-section"
import {
  organizations,
  mainNavigation,
  contentCreation,
  managementTools,
  organizationSettings,
  type Organization,
  type Project,
} from "@/lib/navigation-data"

export function AppSidebar() {
  const [selectedOrg, setSelectedOrg] = React.useState<Organization>(organizations[0])
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null)

  const user = {
    name: "Sarah Johnson",
    email: "sarah@postgen.ai",
    avatar: "/placeholder.svg?height=32&width=32",
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <OrganizationSwitcher selectedOrg={selectedOrg} onOrgChange={setSelectedOrg} />
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="mx-0" />

        <SidebarMenu>
          <SidebarMenuItem>
            <ProjectSwitcher
              selectedProject={selectedProject}
              organizationId={selectedOrg.id}
              onProjectChange={setSelectedProject}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationSection items={mainNavigation} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content Creation */}
        <SidebarGroup>
          <SidebarGroupLabel>Content Creation</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationSection items={contentCreation} defaultOpen={["Social Media"]} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>Tools & Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationSection items={managementTools} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Organization Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Organization</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationSection items={organizationSettings} />
          </SidebarGroupContent>
        </SidebarGroup>
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
  )
}
