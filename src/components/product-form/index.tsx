// src/components/product-form/index.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { Description } from "@/types";

interface ProductFormProps {
  isPro?: boolean;
  initialData?: {
    id?: string;
    name: string;
    category: string;
    keywords: string;
    tone: string;
  };
  onDescriptionsGenerated: (descriptions: Description[]) => void;
  setIsLoading?: (loading: boolean) => void;
  setError?: (error: string | null) => void;
}

const TONE_OPTIONS = [
  { value: "professional", label: "Profesional" },
  { value: "casual", label: "Casual" },
  { value: "enthusiastic", label: "Entusiasta" },
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Amigable" },
];

const CATEGORY_OPTIONS = [
  { value: "electronics", label: "Electrónicos" },
  { value: "clothing", label: "Ropa" },
  { value: "home", label: "Hogar" },
  { value: "beauty", label: "Belleza" },
  { value: "sports", label: "Deportes" },
  { value: "toys", label: "Juguetes" },
  { value: "food", label: "Alimentación" },
  { value: "other", label: "Otro" },
];

export function ProductForm({
  isPro = false,
  initialData,
  onDescriptionsGenerated,
  setIsLoading,
  setError,
}: ProductFormProps) {
  const router = useRouter();

  const [isFormLoading, setIsFormLoading] = useState(false);
  const [name, setName] = useState(initialData?.name || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [keywords, setKeywords] = useState(initialData?.keywords || "");
  const [tone, setTone] = useState(initialData?.tone || "professional");
  const [isProductDataValid, setIsProductDataValid] = useState(true);

  const validateForm = (): boolean => {
    if (!name || !category || !keywords || !tone) {
      setIsProductDataValid(false);
      return false;
    }

    setIsProductDataValid(true);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Error", {
        description: "Por favor completa todos los campos",
      });
      return;
    }

    setIsFormLoading(true);
    if (setIsLoading) setIsLoading(true);
    if (setError) setError(null);

    try {
      // Preparar datos del producto
      const productPayload = {
        name,
        category,
        keywords: keywords.split(",").map((k) => k.trim()),
        tone,
        ...(initialData?.id ? { productId: initialData.id } : {}),
      };

      // Llamar a la API de generación
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error en la respuesta:", errorData);
        throw new Error(errorData.message || "Error al generar descripciones");
      }

      const data = await response.json();

      if (
        !data.descriptions ||
        !Array.isArray(data.descriptions) ||
        data.descriptions.length === 0
      ) {
        throw new Error("No se recibieron descripciones válidas del servidor");
      }

      // Notificar al componente padre
      onDescriptionsGenerated(data.descriptions);

      toast.success("¡Éxito!", {
        description: `Se han generado ${data.descriptions.length} descripciones`,
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Error al generar descripciones", {
        description:
          error.message ||
          "No se pudieron generar las descripciones. Inténtalo nuevamente.",
      });

      if (setError) setError(error.message || "Error al generar descripciones");
    } finally {
      setIsFormLoading(false);
      if (setIsLoading) setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Información del Producto</CardTitle>
        <CardDescription>
          {initialData
            ? "Edita la información para generar nuevas descripciones o usa los datos existentes."
            : "Ingresa los detalles de tu producto para generar descripciones optimizadas."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del producto*</Label>
            <Input
              id="name"
              placeholder="Ej. Auriculares Bluetooth XT-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isFormLoading}
              className={
                !isProductDataValid && !name ? "border-destructive" : ""
              }
            />
            {!isProductDataValid && !name && (
              <p className="text-sm text-destructive">
                El nombre es obligatorio
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría*</Label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isFormLoading}
            >
              <SelectTrigger
                className={
                  !isProductDataValid && !category ? "border-destructive" : ""
                }
              >
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isProductDataValid && !category && (
              <p className="text-sm text-destructive">
                La categoría es obligatoria
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">
              Palabras clave (separadas por comas)*
            </Label>
            <Textarea
              id="keywords"
              placeholder="Ej. inalámbrico, bluetooth, calidad de sonido, batería"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              disabled={isFormLoading}
              className={
                !isProductDataValid && !keywords ? "border-destructive" : ""
              }
            />
            {!isProductDataValid && !keywords ? (
              <p className="text-sm text-destructive">
                Las palabras clave son obligatorias
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Las palabras clave más específicas generan mejores descripciones
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Tono*</Label>
            <Select
              value={tone}
              onValueChange={setTone}
              disabled={isFormLoading}
            >
              <SelectTrigger
                className={
                  !isProductDataValid && !tone ? "border-destructive" : ""
                }
              >
                <SelectValue placeholder="Selecciona un tono" />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isProductDataValid && !tone && (
              <p className="text-sm text-destructive">El tono es obligatorio</p>
            )}
          </div>

          <Button type="submit" disabled={isFormLoading} className="w-full">
            {isFormLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {initialData
                  ? "Generar Nuevas Descripciones"
                  : "Generar Descripciones"}
              </>
            )}
          </Button>
        </form>
      </CardContent>
      {!isPro && (
        <CardFooter className="flex justify-center border-t pt-4">
          <div className="text-sm text-muted-foreground text-center">
            <span className="font-medium">Plan básico: </span>
            Hasta 2 descripciones por generación.
            <Button
              variant="link"
              onClick={() => router.push("/pricing")}
              className="p-0 h-auto font-normal"
            >
              Actualiza a Pro
            </Button>
            para obtener hasta 5 descripciones con bulleted lists y más
            formatos.
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
