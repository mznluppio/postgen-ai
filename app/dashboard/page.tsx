"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Sparkles,
  TrendingUp,
  Users,
  FileText,
  Calendar,
} from "lucide-react";
import { CreateOrganizationDialog } from "@/components/dashboard/CreateOrganizationDialog";
import AuthPage from "../auth/page";

export default function Dashboard() {
  const { user, currentOrganization } = useAuth();

  if (!currentOrganization) {
    return (
      <AuthGuard fallback={<AuthPage />}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Bienvenue sur Postgen AI</CardTitle>
              <CardDescription>
                Créez votre première organisation pour commencer à générer du
                contenu
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <CreateOrganizationDialog />
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Welcome Section */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-2">
          Bienvenue, {user?.name} ! 👋
        </h1>
        <p className="text-muted-foreground mb-4">
          Vous êtes dans l'organisation{" "}
          <strong>{currentOrganization.name}</strong>. Créez du contenu
          exceptionnel avec l'IA.
        </p>
        <Button asChild>
          <a href="/generate">
            <Sparkles className="mr-2 h-4 w-4" />
            Créer du contenu
          </a>
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Génération rapide
            </CardTitle>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="sm" asChild>
              <a href="/generate">
                <Plus className="mr-2 h-4 w-4" />
                Créer du contenu
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce mois-ci</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Contenus créés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projets actifs
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Projets en cours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan actuel</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {currentOrganization.plan}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentOrganization.plan === "starter" && "Gratuit"}
              {currentOrganization.plan === "pro" && "29€/mois"}
              {currentOrganization.plan === "enterprise" && "99€/mois"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contenu récent</CardTitle>
            <CardDescription>Vos dernières créations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun contenu créé pour le moment</p>
              <Button variant="outline" className="mt-4" asChild>
                <a href="/generate">Créer votre premier contenu</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projets</CardTitle>
            <CardDescription>
              Organisez votre contenu par projet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun projet créé pour le moment</p>
              <Button variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Créer un projet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
