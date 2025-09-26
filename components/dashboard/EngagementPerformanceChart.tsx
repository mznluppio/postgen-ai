"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, Loader2 } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { type EngagementTimeseriePoint } from "@/lib/analytics";

const chartConfig = {
  views: {
    label: "Vues",
    color: "#2563EB",
  },
  clicks: {
    label: "Clics",
    color: "#F97316",
  },
  reactions: {
    label: "Réactions",
    color: "#8B5CF6",
  },
} as const;

interface EngagementPerformanceChartProps {
  data: EngagementTimeseriePoint[];
  loading: boolean;
}

export function EngagementPerformanceChart({
  data,
  loading,
}: EngagementPerformanceChartProps) {
  const hasData = data.length > 0;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Performance d'engagement</CardTitle>
        <CardDescription>
          Suivez l'évolution des vues, clics et réactions sur vos contenus.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[320px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Chargement des métriques...
          </div>
        ) : hasData ? (
          <ChartContainer config={chartConfig} className="h-full">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="views"
                stroke="var(--color-views)"
                fill="var(--color-views)"
                fillOpacity={0.15}
                name="Vues"
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="var(--color-clicks)"
                fill="var(--color-clicks)"
                fillOpacity={0.15}
                name="Clics"
              />
              <Area
                type="monotone"
                dataKey="reactions"
                stroke="var(--color-reactions)"
                fill="var(--color-reactions)"
                fillOpacity={0.15}
                name="Réactions"
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center">
            <BarChart2 className="h-10 w-10 mb-3" />
            <p>Aucune donnée d'engagement disponible pour le moment.</p>
            <p className="text-sm">
              Publiez du contenu pour commencer à suivre vos performances.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
