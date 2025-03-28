"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Save, Download, FileText } from "lucide-react";
import { SeoScore } from "@/components/description-generator/seo-score";
import Link from "next/link";

export default function DescriptionDetailPage() {
  const params = useParams();
  const descriptionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState<any>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadDescription = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/descriptions/${descriptionId}`);

        if (!response.ok) {
          throw new Error("Error al cargar la descripción");
        }

        const data = await response.json();
        setDescription(data.data);
        setContent(data.data.content);
      } catch (error) {
        toast.error("No se pudo cargar la descripción");
      } finally {
        setLoading(false);
      }
    };

    if (descriptionId) {
      loadDescription();
    }
  }, [descriptionId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/descriptions/${descriptionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar la descripción");
      }

      toast.success("Descripción guardada correctamente");
    } catch (error) {
      toast.error("No se pudo guardar la descripción");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = (format: "txt" | "html" | "json") => {
    let exportContent = "";
    let fileName = `descripcion-${
      description?.product?.name || "producto"
    }-${new Date().toISOString().slice(0, 10)}`;
    let mimeType = "";

    switch (format) {
      case "txt":
        exportContent = content;
        fileName += ".txt";
        mimeType = "text/plain";
        break;
      case "html":
        exportContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${description?.product?.name || "Descripción de Producto"}</title>
</head>
<body>
  <div class="product-description">
    ${content.replace(/\n/g, "<br>")}
  </div>
</body>
</html>`;
        fileName += ".html";
        mimeType = "text/html";
        break;
      case "json":
        exportContent = JSON.stringify(
          {
            product: description?.product,
            description: {
              content,
              created: description?.createdAt,
            },
          },
          null,
          2
        );
        fileName += ".json";
        mimeType = "application/json";
        break;
    }

    const blob = new Blob([exportContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!description) {
    return (
      <div className="flex flex-col h-[60vh] w-full items-center justify-center">
        <p className="text-lg font-medium">Descripción no encontrada</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/products">Volver a productos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/products/${description.productId}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver al producto
            </Link>
          </Button>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>

      <h1 className="text-2xl font-bold">
        Descripción de {description.product.name}
      </h1>
      <p className="text-muted-foreground">
        Creada el {new Date(description.createdAt).toLocaleDateString()}
      </p>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[300px] p-4 rounded-md border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="La descripción del producto aparecerá aquí..."
              />
            </CardContent>
          </Card>

          <div>
            <h3 className="text-lg font-medium mb-3">Exportar descripción</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("txt")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Exportar como TXT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("html")}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar como HTML
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("json")}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar como JSON
              </Button>
            </div>
          </div>
        </div>

        <div>
          <SeoScore descriptionId={descriptionId} />
        </div>
      </div>
    </div>
  );
}
