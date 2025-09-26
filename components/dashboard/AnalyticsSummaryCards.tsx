"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { type EngagementSummaryCard } from "@/lib/analytics";

const numberFormatter = new Intl.NumberFormat("fr-FR");

function formatSummaryValue(label: string, value: number) {
  if (label === "Taux d'engagement") {
    return `${value}%`;
  }

  return numberFormatter.format(value);
}

function formatChange(change: number) {
  const rounded = Math.abs(change).toFixed(1);
  return `${change >= 0 ? "+" : "-"}${rounded}%`;
}

interface AnalyticsSummaryCardsProps {
  cards: EngagementSummaryCard[];
}

export function AnalyticsSummaryCards({
  cards,
}: AnalyticsSummaryCardsProps) {
  if (!cards.length) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const positive = card.change >= 0;
        return (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium">
                  {card.label}
                </CardTitle>
                <CardDescription>{card.helper}</CardDescription>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${positive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
              >
                {formatChange(card.change)}
              </span>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">
                  {formatSummaryValue(card.label, card.value)}
                </div>
                {positive ? (
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-rose-500" />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
