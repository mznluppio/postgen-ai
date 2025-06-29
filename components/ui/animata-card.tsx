"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AnimataCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn("rounded-xl border border-border bg-background/70 backdrop-blur-md p-6", className)}
    >
      {children}
    </motion.div>
  );
}
