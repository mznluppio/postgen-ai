"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Check, ChevronsUpDown, Plus, Sparkles } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { CreateOrganizationDialog } from "./CreateOrganizationDialog";

export function OrganizationSwitcher() {
  const { currentOrganization, organizations, switchOrganization } = useAuth();

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "enterprise":
        return "from-purple-600 to-pink-600";
      case "pro":
        return "from-blue-600 to-cyan-600";
      case "starter":
        return "from-green-600 to-emerald-600";
      default:
        return "from-gray-600 to-gray-700";
    }
  };

  if (!currentOrganization) {
    return (
      <div className="p-2">
        <CreateOrganizationDialog />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div
            className={`flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br ${getPlanColor(currentOrganization.plan)} text-white`}
          >
            <Sparkles className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{currentOrganization.name}</span>
            <span className="truncate text-xs text-sidebar-foreground/70">
              {currentOrganization.plan} • Propriétaire
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
        <DropdownMenuLabel className="text-xs text-muted-foreground">Changer d'organisation</DropdownMenuLabel>
        {organizations.map((org) => (
          <DropdownMenuItem key={org.$id} onClick={() => switchOrganization(org.$id)} className="gap-2 p-2">
            <div
              className={`flex size-6 items-center justify-center rounded-sm bg-gradient-to-br ${getPlanColor(org.plan)}`}
            >
              <Sparkles className="size-3 text-white" />
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium">{org.name}</span>
              <span className="text-xs text-muted-foreground">
                {org.plan} • Propriétaire
              </span>
            </div>
            {org.$id === currentOrganization.$id && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 p-2">
          <div className="flex size-6 items-center justify-center rounded-md border border-dashed">
            <Plus className="size-4" />
          </div>
          <div className="font-medium text-muted-foreground">Créer une organisation</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}