// src/components/description-generator/index.tsx

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ProductForm } from "@/components/product-form";
import { DescriptionResultCard } from "@/components/description-generator/result-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  SaveAll,
  Sparkles,
} from "lucide-react";
import { Description } from "@/types";

interface DescriptionGeneratorProps {
  isPro?: boolean;
  productData?: {
    id: string;
    name: string;
    category: string;
    keywords: string;
    tone: string;
  };
  onSaveDescription?: (description: Description) => Promise<void>;
  onDescriptionsGenerated?: (descriptions: Description[]) => void;
}

export function DescriptionGenerator({
  isPro = false,
  productData,
  onSaveDescription,
  onDescriptionsGenerated,
}: DescriptionGeneratorProps) {
  const [descriptions, setDescriptions] = useState<Description[]>([]);
  const [activeTab, setActiveTab] = useState("form");
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDescriptionsGenerated = (newDescriptions: Description[]) => {
    setDescriptions(newDescriptions);
    setActiveTab("results");

    if (onDescriptionsGenerated) {
      onDescriptionsGenerated(newDescriptions);
    }
  };

  const handleSaveDescription = async (description: Description) => {
    if (onSaveDescription) {
      try {
        await onSaveDescription(description);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    } else {
      // Simulación de guardado (para el MVP, esto debería conectarse a una API real)
      toast.success("Descripción guardada", {
        description:
          "En un entorno de producción, esto se guardaría en la base de datos.",
      });
      return Promise.resolve();
    }
  };

  const handleSaveAll = async () => {
    if (!onSaveDescription || descriptions.length === 0) return;

    setIsSavingAll(true);

    try {
      // Guardamos las descripciones secuencialmente
      for (const description of descriptions) {
        await onSaveDescription(description);
      }

      toast.success("Todas las descripciones guardadas con éxito");
    } catch (error: any) {
      console.error("Error al guardar todas las descripciones:", error);
      toast.error("Error al guardar todas las descripciones", {
        description:
          error.message ||
          "Algunas descripciones pueden no haberse guardado correctamente.",
      });
    } finally {
      setIsSavingAll(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setActiveTab("form");
  };

  return (
    
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="form" disabled={isLoading}>
              Formulario
            </TabsTrigger>
            <TabsTrigger
              value="results"
              disabled={descriptions.length === 0 || isLoading}
            >
              Resultados {descriptions.length > 0 && `(${descriptions.length})`}
            </TabsTrigger>
          </TabsList>

          {descriptions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveAll}
              disabled={isSavingAll || !onSaveDescription}
            >
              {isSavingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <SaveAll className="mr-2 h-4 w-4" />
                  Guardar Todas
                </>
              )}
            </Button>
          )}
        </div>

        <TabsContent value="form">
          {error ? (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Error al generar descripciones
                </CardTitle>
                <CardDescription>
                  Ocurrió un problema al intentar generar descripciones para tu
                  producto.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{error}</p>
                <Button variant="outline" onClick={handleRetry}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Intentar nuevamente
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ProductForm
              isPro={isPro}
              initialData={productData}
              onDescriptionsGenerated={handleDescriptionsGenerated}
              setIsLoading={setIsLoading}
              setError={setError}
            />
          )}
        </TabsContent>

        <TabsContent value="results">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium">
                Generando descripciones...
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Estamos creando descripciones optimizadas para tu producto.
              </p>
            </div>
          ) : descriptions.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Sin resultados</CardTitle>
                <CardDescription>
                  No se han generado descripciones aún.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  Completa el formulario para generar descripciones para tu
                  producto.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => setActiveTab("form")}>
                  Ir al Formulario
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-sm px-3 py-1">
                  {descriptions.length} Descripciones Generadas
                </Badge>

                {isPro ? (
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-sm px-3 py-1">
                    Plan Pro
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    Plan Básico
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 gap-8">
                {descriptions.map((description, index) => (
                  <DescriptionResultCard
                    key={index}
                    description={description}
                    isPro={isPro}
                    onSave={handleSaveDescription}
                  />
                ))}
              </div>

              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={() => setActiveTab("form")}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generar Nuevas Descripciones
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
