"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import AuthPage from "@/app/auth/page";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  getContentCategory,
  getContentCategoryDescription,
} from "@/lib/content-categories";

const category = getContentCategory("social");
const description = getContentCategoryDescription("social");

export default function SocialContentLandingPage() {
  const { currentOrganization } = useAuth();

  if (!category) {
    return (
      <AuthGuard fallback={<AuthPage />}>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Contenus sociaux</CardTitle>
              <CardDescription>
                Aucune variante de contenu social n'a été configurée.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard fallback={<AuthPage />}>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <h1 className="text-2xl font-bold">{category.title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </motion.div>

        <Separator />

        {!currentOrganization ? (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Organisation requise</CardTitle>
              <CardDescription>
                Créez ou sélectionnez une organisation pour accéder aux variantes
                de contenu social.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {category.items?.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.url}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Card className="h-full">
                    <CardHeader className="space-y-3">
                      <div className="flex items-center gap-3 text-primary">
                        {Icon ? <Icon className="h-5 w-5" /> : null}
                        <CardTitle className="text-lg font-semibold">
                          {item.title}
                        </CardTitle>
                      </div>
                      <CardDescription>
                        Choisissez ce format pour sélectionner ensuite le projet
                        cible et générer vos publications.
                      </CardDescription>
                      <Button asChild className="w-full">
                        <Link href={item.url}>Accéder aux projets</Link>
                      </Button>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </AuthGuard>
  );
}
