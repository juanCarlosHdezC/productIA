// src/app/api/descriptions/[id]/route.ts
// Endpoint para actualizar y eliminar descripciones específicas

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Esquema de validación para actualización de descripciones
const descriptionUpdateSchema = z.object({
  content: z.string().min(1, "El contenido es requerido"),
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

// PATCH - Actualizar una descripción
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const descriptionId = params.id;
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
        { message: "No autorizado para modificar esta descripción" },
        { status: 403 }
      );
    }

    const json = await request.json();

    // Validar datos de entrada
    const result = descriptionUpdateSchema.safeParse(json);

    if (!result.success) {
      const formatted = result.error.format();
      return NextResponse.json(
        { message: "Datos inválidos", errors: formatted },
        { status: 400 }
      );
    }

    const { content } = result.data;

    // Actualizar descripción
    const description = await prisma.description.update({
      where: {
        id: descriptionId,
      },
      data: {
        content,
      },
    });

    return NextResponse.json({
      message: "Descripción actualizada con éxito",
      description,
    });
  } catch (error) {
    console.error("Error al actualizar descripción:", error);
    return NextResponse.json(
      { message: "Error al actualizar descripción" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una descripción
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const descriptionId = params.id;
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
        { message: "No autorizado para eliminar esta descripción" },
        { status: 403 }
      );
    }

    // Eliminar descripción
    await prisma.description.delete({
      where: {
        id: descriptionId,
      },
    });

    return NextResponse.json({
      message: "Descripción eliminada con éxito",
    });
  } catch (error) {
    console.error("Error al eliminar descripción:", error);
    return NextResponse.json(
      { message: "Error al eliminar descripción" },
      { status: 500 }
    );
  }
}
