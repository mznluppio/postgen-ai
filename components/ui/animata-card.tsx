import * as React from "react";
import { Card, CardProps } from "./card";
import { cn } from "@/lib/utils";

export const AnimataCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <Card
      ref={ref}
      className={cn(
        "border-2 border-dashed border-purple-500/50 hover:shadow-lg transition-shadow",
        className,
      )}
      {...props}
    />
  ),
);
AnimataCard.displayName = "AnimataCard";

