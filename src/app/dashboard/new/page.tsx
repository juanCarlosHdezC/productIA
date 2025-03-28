// src/app/dashboard/new/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Save } from "lucide-react";

// Esquema de validación para el formulario de productos
const productFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "El nombre del producto debe tener al menos 2 caracteres",
    })
    .max(100, {
      message: "El nombre del producto no puede tener más de 100 caracteres",
    }),
  category: z.string({
    required_error: "Por favor selecciona una categoría",
  }),
  keywords: z.string().min(3, {
    message: "Por favor ingresa al menos una palabra clave",
  }),
  tone: z.string({
    required_error: "Por favor selecciona un tono",
  }),
});

// Tipo derivado del esquema
type ProductFormValues = z.infer<typeof productFormSchema>;

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

const TONE_OPTIONS = [
  { value: "professional", label: "Profesional" },
  { value: "casual", label: "Casual" },
  { value: "enthusiastic", label: "Entusiasta" },
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Amigable" },
];

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar formulario con valores por defecto
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      category: "",
      keywords: "",
      tone: "professional",
    },
  });

  // Manejar envío del formulario
  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          category: data.category,
          keywords: data.keywords.split(",").map((k) => k.trim()),
          tone: data.tone,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Error al crear el producto");
      }

      toast.success("Producto creado con éxito", {
        description: "Ahora puedes generar descripciones para este producto",
      });

      // Redirigir al usuario a la página del producto o al generador de descripciones
      router.push(`/dashboard/products/${result.product.id}`);
      router.refresh();
    } catch (error: any) {
      console.error("Error al crear el producto:", error);
      toast.error("Error al crear el producto", {
        description: error.message || "Por favor intenta nuevamente",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Crear Nuevo Producto"
        text="Ingresa la información de tu producto para generar descripciones perfectas."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </DashboardHeader>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Detalles del Producto</CardTitle>
          <CardDescription>
            Proporciona información detallada para obtener las mejores
            descripciones con IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Producto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. Auriculares Bluetooth XT-500"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Nombre completo y descriptivo del producto.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      La categoría ayuda a adaptar las descripciones al tipo de
                      producto.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Palabras Clave</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej. inalámbrico, bluetooth, calidad de sonido, batería, cómodo"
                        className="min-h-20"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Palabras clave separadas por comas que describen
                      características, beneficios o USPs.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tono</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tono" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TONE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      El tono determina el estilo de escritura de las
                      descripciones.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Crear Producto
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-5">
          <p className="text-sm text-muted-foreground">
            * Los campos son requeridos para obtener los mejores resultados.
          </p>
        </CardFooter>
      </Card>
    </DashboardShell>
  );
}
