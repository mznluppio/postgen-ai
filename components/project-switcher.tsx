"use client"
import { Check, ChevronDown, FolderOpen, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { projects, type Project } from "@/lib/navigation-data"
import { Badge } from "@/components/ui/badge"

interface ProjectSwitcherProps {
  selectedProject: Project | null
  organizationId: string
  onProjectChange: (project: Project | null) => void
}

export function ProjectSwitcher({ selectedProject, organizationId, onProjectChange }: ProjectSwitcherProps) {
  const orgProjects = projects.filter((p) => p.organizationId === organizationId)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton className="w-full justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="size-4" />
            <span className="truncate">{selectedProject ? selectedProject.name : "All Projects"}</span>
          </div>
          <ChevronDown className="size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-popper-anchor-width] min-w-56 rounded-lg"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">Select Project</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onProjectChange(null)} className="gap-2 p-2">
          <FolderOpen className="size-4" />
          <span>All Projects</span>
          {!selectedProject && <Check className="ml-auto size-4" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {orgProjects.map((project) => (
          <DropdownMenuItem key={project.id} onClick={() => onProjectChange(project)} className="gap-2 p-2">
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{project.name}</span>
                {project.id === selectedProject?.id && <Check className="size-4" />}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`text-xs ${getStatusColor(project.status)}`}>
                  {project.status}
                </Badge>
                <span className="text-xs text-muted-foreground truncate">{project.description}</span>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 p-2">
          <div className="flex size-4 items-center justify-center rounded border border-dashed">
            <Plus className="size-3" />
          </div>
          <span className="font-medium text-muted-foreground">New Project</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
