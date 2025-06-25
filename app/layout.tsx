import "./globals.css";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import clsx from "clsx";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";

const inter = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Postgen AI - Générateur de contenu social",
  description:
    "Générez du contenu professionnel pour LinkedIn et Instagram avec l'IA locale",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={clsx(inter.className)}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}