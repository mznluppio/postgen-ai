"use client";
import { motion } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AceternityButton({ className, children, ...props }: ButtonProps) {
  return (
    <motion.button
      {...props}
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-md px-4 py-2 font-medium text-white",
        className,
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-500 to-pink-500" />
      {children}
    </motion.button>
  );
}
