// src/app/dashboard/products/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ChevronDown,
  Edit,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  RotateCcw,
  FileText,
  Clock,
} from "lucide-react";
import { Description } from "@/types";
import { DescriptionResultCard } from "@/components/description-generator/result-card";
import { DescriptionGenerator } from "@/components/description-generator";
import { UserPlan } from "@/lib/plan";

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
interface ProductDetailPageProps {
  params: { id: string };
}

export default function ProductDetailPage({
  params: routeParams,
}: ProductDetailPageProps) {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [descriptions, setDescriptions] = useState<Description[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isPro, setIsPro] = useState(false);
  const [plan, setPlan] = useState<string | undefined>(undefined);

  const productId = Array.isArray(params.id) ? params.id[0] : params.id ?? "";

  // Inicializar formulario
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      category: "",
      keywords: "",
      tone: "professional",
    },
  });

  // Cargar datos del producto
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);

        if (!response.ok) {
          throw new Error("No se pudo cargar el producto");
        }

        const data = await response.json();
        setProduct(data);

        console.log(data);

        // Preparar descripciones
        const parsedDescriptions: Description[] = data.descriptions.map(
          (desc: any) => {
            try {
              return JSON.parse(desc.content);
            } catch (e) {
              return { title: "Descripción", description: desc.content };
            }
          }
        );

        setDescriptions(parsedDescriptions);

        // Establecer valores del formulario
        form.reset({
          name: data.name,
          category: data.category,
          keywords: Array.isArray(data.keywords)
            ? data.keywords.join(", ")
            : data.keywords,
          tone: data.tone,
        });

        // Verificar si el usuario es Pro (esto debería obtenerse de una API real)
        const userResponse = await fetch(`/api/subscription`);

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setIsPro(userData.isPro);
          setPlan(userData.subscription?.plan);
        }
      } catch (error) {
        console.error("Error al cargar el producto:", error);
        toast.error("No se pudo cargar el producto", {
          description: "Por favor intenta nuevamente o vuelve al dashboard",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, form]);

  // Manejar actualización del producto
  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
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
        throw new Error(result.message || "Error al actualizar el producto");
      }

      setProduct(result.product);

      toast.success("Producto actualizado con éxito");
    } catch (error: any) {
      console.error("Error al actualizar el producto:", error);
      toast.error("Error al actualizar el producto", {
        description: error.message || "Por favor intenta nuevamente",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar eliminación del producto
  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al eliminar el producto");
      }

      toast.success("Producto eliminado con éxito");
      router.push("/dashboard/products");
      router.refresh();
    } catch (error: any) {
      console.error("Error al eliminar el producto:", error);
      toast.error("Error al eliminar el producto", {
        description: error.message || "Por favor intenta nuevamente",
      });
      setIsDeleting(false);
    }
  };

  // Manejar guardado de descripción
  const handleSaveDescription = async (description: Description) => {
    try {
      const response = await fetch("/api/descriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: JSON.stringify(description),
          productId: productId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        // Manejar caso de límite alcanzado
        if (data.upgrade) {
          toast.error("Límite de descripciones alcanzado", {
            description: "Actualiza a Plan Pro para guardar más descripciones",
            action: {
              label: "Actualizar",
              onClick: () => router.push("/pricing"),
            },
          });
          return;
        }

        throw new Error(data.message || "Error al guardar la descripción");
      }

      // Actualizar la lista de descripciones (en un caso real se recargarían desde la API)
      const existingDescription = descriptions.find(
        (d) =>
          d.title === description.title &&
          d.description === description.description
      );

      if (!existingDescription) {
        setDescriptions([description, ...descriptions]);
      }

      return Promise.resolve();
    } catch (error: any) {
      console.error("Error al guardar la descripción:", error);
      toast.error("Error al guardar la descripción", {
        description: error.message || "Por favor intenta nuevamente",
      });

      return Promise.reject(error);
    }
  };

  // Manejar generación de nuevas descripciones
  const handleDescriptionsGenerated = (newDescriptions: Description[]) => {
    setActiveTab("generator");
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Cargando producto..."
          text="Por favor espera mientras cargamos la información del producto."
        >
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={true}
          >
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando...
          </Button>
        </DashboardHeader>

        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardShell>
    );
  }

  if (!product) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Producto no encontrado"
          text="No se ha podido encontrar el producto solicitado."
        >
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/products")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Productos
          </Button>
        </DashboardHeader>

        <div className="flex flex-col items-center justify-center h-64">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Producto no encontrado</h2>
          <p className="text-muted-foreground text-center max-w-md">
            El producto que estás buscando no existe o no tienes permisos para
            acceder a él.
          </p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={product.name}
        text={`Gestiona y genera descripciones para este producto.`}
      >
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            disabled={isSubmitting || isDeleting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isSubmitting || isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente el producto "
                  {product.name}" y todas sus descripciones asociadas. Esta
                  acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar producto"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardHeader>

      <Tabs
        defaultValue="details"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="details" className="flex items-center gap-1">
              <Edit className="h-4 w-4" />
              <span>Detalles</span>
            </TabsTrigger>
            <TabsTrigger value="generator" className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              <span>Generar</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Historial</span>
              {descriptions.length > 0 && (
                <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                  {descriptions.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={() => setActiveTab("generator")}
            className="flex items-center"
            size="sm"
          >
            <Plus className="mr-1 h-4 w-4" />
            Nueva Descripción
          </Button>
        </div>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Producto</CardTitle>
              <CardDescription>
                Edita la información de tu producto para mejorar las
                descripciones generadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
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
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          La categoría ayuda a adaptar las descripciones al tipo
                          de producto.
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
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
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
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generator">
          <Card>
            <CardHeader>
              <CardTitle>Generador de Descripciones</CardTitle>
              <CardDescription>
                Crea descripciones persuasivas basadas en la información del
                producto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DescriptionGenerator
                isPro={true}
                productData={{
                  id: productId,
                  name: product.name,
                  category: product.category,
                  keywords: Array.isArray(product.keywords)
                    ? product.keywords.join(", ")
                    : product.keywords,
                  tone: product.tone,
                }}
                onSaveDescription={handleSaveDescription}
                onDescriptionsGenerated={handleDescriptionsGenerated}
                plan={plan}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Descripciones</CardTitle>
              <CardDescription>
                Revisa, edita y reutiliza las descripciones generadas
                anteriormente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {descriptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">
                    No hay descripciones guardadas
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    Aún no has generado descripciones para este producto.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setActiveTab("generator")}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generar Descripciones
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {descriptions.map((description, index) => (
                    <DescriptionResultCard
                      key={index}
                      description={description}
                      isPro={isPro}
                      onSave={handleSaveDescription}
                    />
                  ))}
                </div>
              )}
            </CardContent>
            {descriptions.length > 0 && (
              <CardFooter className="flex justify-between border-t pt-5">
                <Button variant="ghost" size="sm" disabled>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Actualizar
                </Button>
                <Button
                  className="flex items-center"
                  onClick={() => setActiveTab("generator")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Generar Nueva Descripción
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
