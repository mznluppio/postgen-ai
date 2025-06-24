"use client"
import { Check, ChevronsUpDown, Plus, Sparkles } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { organizations, type Organization } from "@/lib/navigation-data"

interface OrganizationSwitcherProps {
  selectedOrg: Organization
  onOrgChange: (org: Organization) => void
}

export function OrganizationSwitcher({ selectedOrg, onOrgChange }: OrganizationSwitcherProps) {
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Enterprise":
        return "from-purple-600 to-pink-600"
      case "Pro":
        return "from-blue-600 to-cyan-600"
      case "Starter":
        return "from-green-600 to-emerald-600"
      default:
        return "from-gray-600 to-gray-700"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div
            className={`flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br ${getPlanColor(selectedOrg.plan)} text-white`}
          >
            <Sparkles className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{selectedOrg.name}</span>
            <span className="truncate text-xs text-sidebar-foreground/70">
              {selectedOrg.plan} • {selectedOrg.role}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-popper-anchor-width] min-w-56 rounded-lg"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Organization</DropdownMenuLabel>
        {organizations.map((org) => (
          <DropdownMenuItem key={org.id} onClick={() => onOrgChange(org)} className="gap-2 p-2">
            <div
              className={`flex size-6 items-center justify-center rounded-sm bg-gradient-to-br ${getPlanColor(org.plan)}`}
            >
              <Sparkles className="size-3 text-white" />
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium">{org.name}</span>
              <span className="text-xs text-muted-foreground">
                {org.plan} • {org.role}
              </span>
            </div>
            {org.id === selectedOrg.id && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 p-2">
          <div className="flex size-6 items-center justify-center rounded-md border border-dashed">
            <Plus className="size-4" />
          </div>
          <div className="font-medium text-muted-foreground">Create Organization</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
