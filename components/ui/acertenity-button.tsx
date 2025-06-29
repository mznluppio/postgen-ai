import * as React from "react";
import { Button, ButtonProps } from "./button";
import { cn } from "@/lib/utils";

export const AcertenityButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <Button
      ref={ref}
      className={cn(
        "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90",
        className,
      )}
      {...props}
    />
  ),
);
AcertenityButton.displayName = "AcertenityButton";

