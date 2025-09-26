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
import {
  EMAIL_CONTENT_TYPES,
  buildEmailTypeUrl,
} from "@/lib/email-content";

const category = getContentCategory("email");
const description = getContentCategoryDescription("email");

export default function EmailContentLandingPage() {
  const { currentOrganization } = useAuth();

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
          <h1 className="text-2xl font-bold">
            {category?.title ?? "Email Marketing"}
          </h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </motion.div>

        <Separator />

        {!currentOrganization ? (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Organisation requise</CardTitle>
              <CardDescription>
                Créez ou sélectionnez une organisation pour accéder aux formats
                email.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {EMAIL_CONTENT_TYPES.map((variant, index) => {
              const Icon = variant.icon;
              return (
                <motion.div
                  key={variant.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Card className="h-full">
                    <CardHeader className="space-y-3">
                      <div className="flex items-center gap-3 text-primary">
                        <Icon className="h-5 w-5" />
                        <CardTitle className="text-lg font-semibold">
                          {variant.title}
                        </CardTitle>
                      </div>
                      <CardDescription>{variant.description}</CardDescription>
                      <Button asChild className="w-full">
                        <Link href={buildEmailTypeUrl(variant.id)}>
                          Choisir ce format
                        </Link>
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
