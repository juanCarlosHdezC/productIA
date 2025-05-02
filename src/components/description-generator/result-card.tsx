// src/components/description-generator/result-card.tsx

"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, Download, Save, Edit, Check } from "lucide-react";
import { Description } from "@/types"; // Importamos la interfaz

interface DescriptionResultCardProps {
  description: Description;
  isPro?: boolean;
  onSave?: (description: Description) => Promise<void>;
  plan?: string;
}

export function DescriptionResultCard({
  description,
  isPro = false,
  onSave,
  plan,
}: DescriptionResultCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(
    description.description
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedDescription);
    toast.info("Copiado al portapapeles", {
      description: "La descripción ha sido copiada",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([editedDescription], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `descripcion-${description.title
      .toLowerCase()
      .replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave({
          ...description,
          description: editedDescription,
        });

        toast.success("Guardado exitoso", {
          description: "La descripción ha sido guardada",
        });

        setIsEditing(false);
      } catch (error) {
        toast.error("Error", {
          description: "No se pudo guardar la descripción",
        });
      } finally {
        setIsSaving(false);
      }
    }
  };


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{description.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="min-h-[200px]"
          />
        ) : (
          <>
            <div className="whitespace-pre-wrap mb-4">{editedDescription}</div>

            {isPro && description.bullets && description.bullets.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Puntos destacados:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {description.bullets.map((bullet, index) => (
                    <li key={index}>{bullet}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="mr-2"
              >
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>Guardando...</>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Guardar
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="mr-2"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copiar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="mr-2"
          >
            <Download className="mr-2 h-4 w-4" />
            Descargar
          </Button>
          {onSave && !isEditing && (
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              Guardar
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
