"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardStatCardProps {
  title: string;
  description?: ReactNode;
  value?: ReactNode;
  subtitle?: ReactNode;
  icon?: LucideIcon;
  meta?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function DashboardStatCard({
  title,
  description,
  value,
  subtitle,
  icon: Icon,
  meta,
  children,
  className,
  contentClassName,
}: DashboardStatCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {meta ?? (Icon ? <Icon className="h-5 w-5 text-primary" /> : null)}
      </CardHeader>
      <CardContent className={cn("space-y-2", contentClassName)}>
        {value !== undefined ? (
          <div className="text-2xl font-bold leading-none tracking-tight">{value}</div>
        ) : null}
        {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
        {children}
      </CardContent>
    </Card>
  );
}
