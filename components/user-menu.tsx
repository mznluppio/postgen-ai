"use client";

import {
  Bell,
  ChevronDown,
  CreditCard,
  HelpCircle,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { getAvatarUrl } from "@/lib/get-avatar-url";

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const { logout } = useAuth();

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  console.log(user);
  const router = useRouter();
  const avatarUrl = getAvatarUrl(user.avatar);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage
              src={avatarUrl || "/placeholder.svg"}
              alt={user.name}
            />
            <AvatarFallback className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="truncate text-xs text-sidebar-foreground/70">
              {user.email}
            </span>
          </div>
          <ChevronDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-popper-anchor-width] min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage
                src={avatarUrl || "/placeholder.svg"}
                alt={user.name}
              />
              <AvatarFallback className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push("/dashboard/account")}>
          <Settings className="mr-2 h-4 w-4" />
          Paramètres du compte
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/dashboard/notifications")}
        >
          <Bell className="mr-2 h-4 w-4" />
          Notifications
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard/billing")}>
          <CreditCard className="mr-2 h-4 w-4" />
          Facturation
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard/help")}>
          <HelpCircle className="mr-2 h-4 w-4" />
          Aide & Support
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
