// src/app/api/products/[id]/route.ts
// Endpoint para obtener, actualizar y eliminar un producto específico

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Esquema de validación para actualización de productos
const productUpdateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  category: z.string().min(1, "La categoría es requerida").optional(),
  keywords: z
    .array(z.string())
    .or(z.string())
    .transform((val) =>
      typeof val === "string" ? val.split(",").map((k) => k.trim()) : val
    )
    .optional(),
  tone: z.string().min(1, "El tono es requerido").optional(),
});

// Función para verificar propiedad del producto
async function checkProductOwnership(productId: string, userId: string) {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
      userId: userId,
    },
  });

  return !!product;
}

// GET - Obtener un producto específico
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const productId = context.params.id;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Verificar propiedad
    const isOwner = await checkProductOwnership(productId, session.user.id);
    if (!isOwner) {
      return NextResponse.json(
        { message: "No autorizado para acceder a este producto" },
        { status: 403 }
      );
    }

    // Obtener producto con sus descripciones
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        descriptions: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return NextResponse.json(
      { message: "Error al obtener producto" },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar un producto
export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const productId = context.params.id;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Verificar propiedad
    const isOwner = await checkProductOwnership(productId, session.user.id);
    if (!isOwner) {
      return NextResponse.json(
        { message: "No autorizado para modificar este producto" },
        { status: 403 }
      );
    }

    const json = await request.json();

    // Validar datos de entrada
    const result = productUpdateSchema.safeParse(json);

    if (!result.success) {
      const formatted = result.error.format();
      return NextResponse.json(
        { message: "Datos inválidos", errors: formatted },
        { status: 400 }
      );
    }

    // Actualizar producto
    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: result.data,
    });

    return NextResponse.json({
      message: "Producto actualizado con éxito",
      product,
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      { message: "Error al actualizar producto" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un producto
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const productId = context.params.id;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Verificar propiedad
    const isOwner = await checkProductOwnership(productId, session.user.id);
    if (!isOwner) {
      return NextResponse.json(
        { message: "No autorizado para eliminar este producto" },
        { status: 403 }
      );
    }

    // Eliminar producto (las descripciones se eliminarán en cascada según el schema)
    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return NextResponse.json({
      message: "Producto eliminado con éxito",
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json(
      { message: "Error al eliminar producto" },
      { status: 500 }
    );
  }
}
