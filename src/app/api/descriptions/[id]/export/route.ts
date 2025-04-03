// src/app/api/descriptions/[id]/export/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkSubscription } from "@/utils/subscription";
import { z } from "zod";

// Esquema para validar parámetros de exportación
const exportParamsSchema = z.object({
  format: z.enum(["txt", "html", "json"]).default("txt"),
});

// Función para verificar propiedad de la descripción
async function checkDescriptionOwnership(
  descriptionId: string,
  userId: string
) {
  const description = await prisma.description.findUnique({
    where: {
      id: descriptionId,
      userId: userId,
    },
  });

  return !!description;
}

// GET - Exportar descripción en diferentes formatos
export async function GET(request: Request, context: any) {
  const { id: descriptionId } = context.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Verificar propiedad
    const isOwner = await checkDescriptionOwnership(
      descriptionId,
      session.user.id
    );
    if (!isOwner) {
      return NextResponse.json(
        { message: "No autorizado para acceder a esta descripción" },
        { status: 403 }
      );
    }

    // Obtener la descripción
    const description = await prisma.description.findUnique({
      where: {
        id: descriptionId,
      },
      include: {
        product: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    });

    if (!description) {
      return NextResponse.json(
        { message: "Descripción no encontrada" },
        { status: 404 }
      );
    }

    // Verificar si el usuario tiene plan Pro para ciertos formatos
    const isPro = await checkSubscription(session.user.id);

    // Analizar parámetros de consulta
    const { searchParams } = new URL(request.url);
    const formatParam = searchParams.get("format") || "txt";

    // Validar formato
    const result = exportParamsSchema.safeParse({ format: formatParam });

    if (!result.success) {
      return NextResponse.json(
        { message: "Formato de exportación inválido" },
        { status: 400 }
      );
    }

    const { format } = result.data;

    // Verificar restricciones de formato según plan
    if (format === "html" && !isPro) {
      return NextResponse.json(
        {
          message: "Formato HTML solo disponible para usuarios Pro",
          upgrade: true,
        },
        { status: 403 }
      );
    }

    // Parsear el contenido de la descripción
    let parsedContent;
    try {
      parsedContent = JSON.parse(description.content);
    } catch (error) {
      parsedContent = {
        title: "Descripción",
        description: description.content,
        bullets: [],
      };
    }

    // Generar contenido según formato
    let exportedContent: string;
    let contentType;
    let filename;

    switch (format) {
      case "html":
        // Generar HTML
        exportedContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${parsedContent.title} - ${description.product.name}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .meta {
            font-size: 14px;
            color: #666;
            margin-bottom: 20px;
        }
        .description {
            margin-bottom: 25px;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        footer {
            margin-top: 30px;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <h1>${parsedContent.title}</h1>
    <div class="meta">
        <div>Producto: ${description.product.name}</div>
        <div>Categoría: ${description.product.category}</div>
    </div>
    <div class="description">
        ${parsedContent.description.replace(/\n/g, "<br>")}
    </div>
    ${
      parsedContent.bullets && parsedContent.bullets.length > 0
        ? `
    <h2>Características destacadas:</h2>
    <ul>
        ${parsedContent.bullets
          .map((bullet: string) => `<li>${bullet}</li>`)
          .join("\n        ")}
    </ul>
    `
        : ""
    }
    <footer>
        Generado por DescribeAI el ${new Date().toLocaleDateString("es-ES")}
    </footer>
</body>
</html>`;
        contentType = "text/html";
        filename = `${description.product.name
          .toLowerCase()
          .replace(/\s+/g, "-")}-descripcion.html`;
        break;

      case "json":
        // Exportar JSON
        exportedContent = JSON.stringify(
          {
            product: {
              name: description.product.name,
              category: description.product.category,
            },
            description: parsedContent,
            meta: {
              generatedAt: description.createdAt,
              exportedAt: new Date(),
            },
          },
          null,
          2
        );
        contentType = "application/json";
        filename = `${description.product.name
          .toLowerCase()
          .replace(/\s+/g, "-")}-descripcion.json`;
        break;

      case "txt":
      default:
        // Formato de texto simple
        exportedContent = `${parsedContent.title}\n\n`;
        exportedContent += `Producto: ${description.product.name}\n`;
        exportedContent += `Categoría: ${description.product.category}\n\n`;
        exportedContent += `${parsedContent.description}\n\n`;

        if (parsedContent.bullets && parsedContent.bullets.length > 0) {
          exportedContent += "Características destacadas:\n";
          parsedContent.bullets.forEach((bullet: string, index: number) => {
            exportedContent += `${index + 1}. ${bullet}\n`;
          });
        }

        exportedContent += `\nGenerado por DescribeAI el ${new Date().toLocaleDateString(
          "es-ES"
        )}`;
        contentType = "text/plain";
        filename = `${description.product.name
          .toLowerCase()
          .replace(/\s+/g, "-")}-descripcion.txt`;
        break;
    }

    // Configurar headers para descarga
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);

    return new NextResponse(exportedContent, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error al exportar descripción:", error);
    return NextResponse.json(
      { message: "Error al exportar descripción" },
      { status: 500 }
    );
  }
}
