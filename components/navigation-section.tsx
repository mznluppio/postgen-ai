"use client"
import { ChevronRight } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import type { NavigationItem } from "@/lib/navigation-data"
import { Badge } from "@/components/ui/badge"

interface NavigationSectionProps {
  items: NavigationItem[]
  defaultOpen?: string[]
}

export function NavigationSection({ items, defaultOpen = [] }: NavigationSectionProps) {
  return (
    <SidebarMenu>
      {items.map((item) => {
        const hasSubItems = item.items && item.items.length > 0
        const isDefaultOpen = defaultOpen.includes(item.title)

        if (hasSubItems) {
          return (
            <Collapsible key={item.title} asChild defaultOpen={isDefaultOpen} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.tooltip ?? item.title} className="w-full">
                    <item.icon className="size-4" />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                          <a href={subItem.url} className="flex items-center gap-2">
                            <span>{subItem.title}</span>
                            {subItem.badge && (
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {subItem.badge}
                              </Badge>
                            )}
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        }

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild={!item.disabled}
              isActive={item.isActive}
              tooltip={item.tooltip ?? item.title}
              disabled={item.disabled}
              className={item.disabled ? "cursor-not-allowed opacity-60" : undefined}
            >
              {item.disabled ? (
                <div className="flex items-center gap-2">
                  <item.icon className="size-4" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              ) : (
                <a href={item.url} className="flex items-center gap-2">
                  <item.icon className="size-4" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </a>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
