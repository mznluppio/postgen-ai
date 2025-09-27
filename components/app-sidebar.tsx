"use client"

import * as React from "react"
import { useAuth } from "@/contexts/AuthContext"
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
import { OrganizationSwitcher } from "@/components/dashboard/OrganizationSwitcher"
import { UserMenu } from "./user-menu"
import { NavigationSection } from "./navigation-section"
import {
  mainNavigation,
  contentCreation,
  managementTools,
  organizationSettings,
} from "@/lib/navigation-data"
import { useOrganizationIntegrations } from "@/hooks/useOrganizationIntegrations"
import {
  evaluateFeatureAvailability,
  formatIntegrationIds,
} from "@/lib/feature-gates"
import { PLAN_LABELS, type Plan } from "@/lib/plans"

export function AppSidebar() {
  const { user, currentOrganization } = useAuth()
  const integrationState = useOrganizationIntegrations(currentOrganization)
  const { activeCount } = integrationState
  const plan = (currentOrganization?.plan ?? "starter") as Plan

  const enhanceNavigation = React.useCallback(
    (items: typeof mainNavigation) =>
      items.map((item) => {
        const enhanced = { ...item }

        if (item.items?.length) {
          enhanced.items = enhanceNavigation(item.items)
        }

        if (item.minimumPlan || item.requiresIntegrations) {
          const evaluation = evaluateFeatureAvailability(plan, integrationState.integrations, {
            minimumPlan: item.minimumPlan,
            requiredIntegrations: item.requiresIntegrations,
          })

          const reasons: string[] = []

          if (!evaluation.hasPlanAccess && item.minimumPlan) {
            reasons.push(`Disponible avec le plan ${PLAN_LABELS[item.minimumPlan]}`)
          }

          if (!evaluation.hasRequiredIntegrations && item.requiresIntegrations?.length) {
            const requirementText = formatIntegrationIds(
              evaluation.missingIntegrations.length
                ? evaluation.missingIntegrations
                : item.requiresIntegrations,
            )
            if (requirementText) {
              reasons.push(`Connectez ${requirementText} dans les intégrations`)
            }
          }

          enhanced.disabled = Boolean(enhanced.disabled || !evaluation.hasAccess)
          if (reasons.length) {
            enhanced.tooltip = reasons.join(". ")
          }

          if (!item.badge && enhanced.disabled && item.minimumPlan) {
            enhanced.badge = `${PLAN_LABELS[item.minimumPlan]}+`
          }
        }

        return enhanced
      }),
    [integrationState.integrations, plan],
  )

  const settingsNavigation = React.useMemo(() => {
    const base = organizationSettings.map((item) => {
      if (item.url === "/dashboard/settings/integrations") {
        const badge =
          activeCount > 0
            ? `${activeCount} connecté${activeCount > 1 ? "s" : ""}`
            : undefined

        return {
          ...item,
          badge,
        }
      }

      return item
    })

    return enhanceNavigation(base)
  }, [activeCount, enhanceNavigation])

  const gatedMainNavigation = React.useMemo(
    () => enhanceNavigation(mainNavigation),
    [enhanceNavigation],
  )

  const gatedManagementTools = React.useMemo(
    () => enhanceNavigation(managementTools),
    [enhanceNavigation],
  )

  const gatedContentCreation = React.useMemo(
    () => enhanceNavigation(contentCreation),
    [enhanceNavigation],
  )

  if (!user) return null

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
            <NavigationSection items={gatedMainNavigation} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content Creation */}
        <SidebarGroup>
          <SidebarGroupLabel>Création de contenu</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationSection items={gatedContentCreation} defaultOpen={["Social Media"]} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>Outils & Gestion</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationSection items={gatedManagementTools} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Organization Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Organisation</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationSection items={settingsNavigation} />
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