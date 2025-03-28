// src/components/dashboard/stats-cards.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, FileText, Sparkles } from "lucide-react";

interface StatsCardsProps {
  totalProducts: number;
  totalDescriptions: number;
  isPro: boolean;
  plan: string;
}

export function StatsCards({
  totalProducts,
  totalDescriptions,
  isPro,
  plan,
}: StatsCardsProps) {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            Productos creados hasta ahora
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Descripciones</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDescriptions}</div>
          <p className="text-xs text-muted-foreground">
            Descripciones generadas y guardadas
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Plan Actual</CardTitle>
          <Sparkles
            className={`h-4 w-4 ${
              isPro ? "text-yellow-500" : "text-muted-foreground"
            }`}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{plan}</div>
          <p className="text-xs text-muted-foreground">
            {plan === "Pro"
              ? "Todas las funciones desbloqueadas"
              : "Actualiza para más funciones"}
          </p>
        </CardContent>
      </Card>
    </>
  );
}
