"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Loader2 } from "lucide-react";
import { type ContentPerformance } from "@/lib/analytics";

const numberFormatter = new Intl.NumberFormat("fr-FR");

interface TopContentTableProps {
  items: ContentPerformance[];
  loading: boolean;
}

export function TopContentTable({ items, loading }: TopContentTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top contenus</CardTitle>
        <CardDescription>
          Classement des contenus les plus performants sur la période suivie.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Chargement des données…
          </div>
        ) : items.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contenu</TableHead>
                <TableHead className="text-right">Vues</TableHead>
                <TableHead className="text-right">Clics</TableHead>
                <TableHead className="text-right">Réactions</TableHead>
                <TableHead className="text-right">Taux d'engagement</TableHead>
                <TableHead className="text-right">Évolution S-1</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.contentId}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {item.title || item.contentId}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {numberFormatter.format(item.views)}
                  </TableCell>
                  <TableCell className="text-right">
                    {numberFormatter.format(item.clicks)}
                  </TableCell>
                  <TableCell className="text-right">
                    {numberFormatter.format(item.reactions)}
                  </TableCell>
                  <TableCell className="text-right">{item.engagementRate}%</TableCell>
                  <TableCell className="text-right">
                    {item.weekOverWeekChange >= 0 ? "+" : ""}
                    {item.weekOverWeekChange}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-3 opacity-60" />
            <p>Aucun contenu n'a encore généré d'engagement mesurable.</p>
            <p className="text-sm">
              Lancez une campagne depuis l'onglet Génération pour alimenter ce tableau.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
