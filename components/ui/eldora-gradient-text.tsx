import { cn } from "@/lib/utils";

export function EldoraGradientText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("bg-gradient-to-r from-fuchsia-500 via-red-500 to-amber-400 bg-clip-text text-transparent font-extrabold", className)}>
      {children}
    </span>
  );
}
