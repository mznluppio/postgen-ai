"use client";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

export function CuicuiButton({ className, children, ...props }: ButtonProps) {
  return (
    <Button {...props} className={cn("relative overflow-hidden pl-4 pr-6", className)}>
      <span className="absolute inset-0 -z-10 rounded-md bg-gradient-to-r from-sky-400 to-blue-600" />
      {children}
      <ArrowRight className="ml-2 w-4 h-4" />
    </Button>
  );
}
