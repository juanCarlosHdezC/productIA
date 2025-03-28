"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Loader2,
  RefreshCw,
  Check,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import type { SeoAnalysisResponse } from "@/lib/seo-analyzer";

interface SeoScoreProps {
  descriptionId: string;
}

export function SeoScore({ descriptionId }: SeoScoreProps) {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [seoData, setSeoData] = useState<SeoAnalysisResponse | null>(null);

  // Función para cargar datos de SEO existentes
  const loadSeoData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/descriptions/${descriptionId}/seo`);

      if (!response.ok) {
        if (response.status === 404) {
          // Si no hay análisis, no mostramos error
          return;
        }
        const error = await response.json();
        throw new Error(error.error || "Error al cargar el análisis SEO");
      }

      const data = await response.json();
      setSeoData(data.data);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error al cargar el análisis SEO");
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para realizar un nuevo análisis SEO
  const performSeoAnalysis = async () => {
    try {
      setAnalyzing(true);
      const response = await fetch(`/api/descriptions/${descriptionId}/seo`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al realizar el análisis SEO");
      }

      const data = await response.json();
      setSeoData(data.data);
      toast.success("Análisis SEO completado con éxito");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error al realizar el análisis SEO");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  // Cargar datos al montar el componente
  useState(() => {
    loadSeoData();
  });

  // Función para obtener color según la puntuación
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  // Función para obtener la etiqueta según la puntuación
  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Aceptable";
    return "Necesita mejoras";
  };

  // Si estamos cargando o analizando
  if (loading || analyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análisis SEO</CardTitle>
          <CardDescription>
            {loading
              ? "Cargando análisis existente..."
              : "Analizando descripción..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Si no hay datos de SEO
  if (!seoData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análisis SEO</CardTitle>
          <CardDescription>
            Analiza la descripción para obtener sugerencias de mejora y
            optimización SEO
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
          <p className="text-center text-muted-foreground">
            No hay análisis SEO para esta descripción todavía
          </p>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={performSeoAnalysis}
            disabled={analyzing}
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Analizar descripción
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Renderizar los resultados del análisis SEO
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Análisis SEO</CardTitle>
            <CardDescription>
              Resultados y recomendaciones de optimización
            </CardDescription>
          </div>
          <Badge variant={seoData.score >= 80 ? "default" : "outline"}>
            {getScoreLabel(seoData.score)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="meta">Meta Tags</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Puntuación general</p>
                  <p
                    className={`text-xl font-bold ${getScoreColor(
                      seoData.score
                    )}`}
                  >
                    {seoData.score}/100
                  </p>
                </div>
                <Progress value={seoData.score} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Densidad de keywords</p>
                  <p
                    className={`text-lg font-semibold ${getScoreColor(
                      seoData.keywordDensity * 100
                    )}`}
                  >
                    {seoData.keywordDensity.toFixed(1)}%
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Legibilidad</p>
                  <p
                    className={`text-lg font-semibold ${getScoreColor(
                      seoData.readabilityScore
                    )}`}
                  >
                    {seoData.readabilityScore}/100
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details">
            <div className="space-y-4">
              <p className="text-sm font-medium">Sugerencias de mejora:</p>
              <ul className="space-y-2">
                {(seoData.suggestions as string[]).map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="meta">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Meta título sugerido:</p>
                <Card className="p-3 bg-muted/50">
                  <p className="text-sm font-semibold">{seoData.metaTitle}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {seoData.metaTitle?.length || 0}/60 caracteres
                  </p>
                </Card>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Meta descripción sugerida:
                </p>
                <Card className="p-3 bg-muted/50">
                  <p className="text-sm">{seoData.metaDescription}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {seoData.metaDescription?.length || 0}/160 caracteres
                  </p>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={performSeoAnalysis}
          disabled={analyzing}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar análisis
        </Button>
      </CardFooter>
    </Card>
  );
}
