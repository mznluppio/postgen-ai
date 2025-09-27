"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}

export function PageShell({
  children,
  className,
  padded = true,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-8", // ensure vertical rhythm
        padded && "pb-10",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {description && (
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
          )}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}

interface PageSectionProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function PageSection({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
}: PageSectionProps) {
  return (
    <section className={cn("flex flex-col gap-6", className)}>
      {(title || description || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            {title && <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>}
            {description && (
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                {description}
              </p>
            )}
          </div>
          {actions ? (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </header>
      )}
      <div className={cn("space-y-6", contentClassName)}>{children}</div>
    </section>
  );
}
