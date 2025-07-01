"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { AceternityButton } from "@/components/ui/aceternity-button";
import LandingPage from "@/components/landing-page";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/[0.96]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-neutral-300">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <AceternityButton disabled className="px-6 py-3 text-sm">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        Chargement...
      </AceternityButton>
    </div>
  );
}