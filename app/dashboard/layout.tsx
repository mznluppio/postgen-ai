"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AuthGuard } from "@/components/auth/AuthGuard";
import AuthPage from "../auth/page";
import { CreateOrganizationDialog } from "@/components/dashboard/CreateOrganizationDialog";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentOrganization } = useAuth();
  const pathname = usePathname();

  if (!currentOrganization) {
    return (
      <AuthGuard fallback={<AuthPage />}>
        <div>
          <CreateOrganizationDialog />
        </div>
      </AuthGuard>
    );
  }

  // Génère les segments du chemin
  const segments = pathname
    .split("/")
    .filter((seg) => seg && seg !== "dashboard");

  return (
    <AuthGuard fallback={<AuthPage />}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mx-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    {currentOrganization.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>

                {segments.map((segment, index) => {
                  const href = `/dashboard/${segments.slice(0, index + 1).join("/")}`;
                  const isLast = index === segments.length - 1;
                  const label = decodeURIComponent(segment)
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase());

                  return (
                    <span key={href} className="flex items-center">
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </span>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="flex flex-1 flex-col p-4 pt-2">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
