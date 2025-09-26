"use client";

import type { Key, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardEditableListSectionProps<T> {
  title: string;
  description?: ReactNode;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getItemKey?: (item: T, index: number) => Key;
  emptyState?: ReactNode;
  badge?: ReactNode | number | null;
  className?: string;
  itemClassName?: string;
}

export function DashboardEditableListSection<T>({
  title,
  description,
  items,
  renderItem,
  getItemKey,
  emptyState,
  badge,
  className,
  itemClassName,
}: DashboardEditableListSectionProps<T>) {
  const badgeContent =
    badge === null
      ? null
      : typeof badge === "number"
        ? badge >= 0
          ? (
              <Badge variant="outline">{badge}</Badge>
            )
          : null
        : badge ?? <Badge variant="outline">{items.length}</Badge>;

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <span>{title}</span>
          {badgeContent}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {items.length ? (
          items.map((item, index) => (
            <div
              key={getItemKey ? getItemKey(item, index) : index}
              className={cn("rounded-lg border p-4", itemClassName)}
            >
              {renderItem(item, index)}
            </div>
          ))
        ) : (
          emptyState ?? (
            <p className="text-sm text-muted-foreground">
              Aucun élément à afficher pour le moment.
            </p>
          )
        )}
      </CardContent>
    </Card>
  );
}
