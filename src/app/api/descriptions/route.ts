// src/app/api/descriptions/route.ts
// Endpoint para guardar nuevas descripciones

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkSubscription } from "@/utils/subscription";
import { z } from "zod";

// Esquema de validación para descripciones
const descriptionCreateSchema = z.object({
  content: z.string().min(1, "El contenido es requerido"),
  productId: z.string().min(1, "El ID del producto es requerido"),
});

// POST - Guardar una nueva descripción
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const json = await request.json();

    // Validar datos de entrada
    const result = descriptionCreateSchema.safeParse(json);

    if (!result.success) {
      const formatted = result.error.format();
      return NextResponse.json(
        { message: "Datos inválidos", errors: formatted },
        { status: 400 }
      );
    }

    const { content, productId } = result.data;

    // Verificar que el producto pertenece al usuario
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        userId: session.user.id,
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Producto no encontrado o no autorizado" },
        { status: 404 }
      );
    }

    // Verificar límites del plan
    const isPro = await checkSubscription(session.user.id);
    const descriptionCount = await prisma.description.count({
      where: {
        userId: session.user.id,
      },
    });

    // Límite para usuarios básicos (ajustar según tus necesidades)
    const BASIC_DESCRIPTION_LIMIT = 50;
    if (!isPro && descriptionCount >= BASIC_DESCRIPTION_LIMIT) {
      return NextResponse.json(
        {
          message:
            "Has alcanzado el límite de descripciones para tu plan básico",
          upgrade: true,
        },
        { status: 403 }
      );
    }

    // Crear la descripción
    const description = await prisma.description.create({
      data: {
        content,
        productId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { message: "Descripción guardada con éxito", description },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al guardar descripción:", error);
    return NextResponse.json(
      { message: "Error al guardar descripción" },
      { status: 500 }
    );
  }
}
