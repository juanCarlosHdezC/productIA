// src/app/api/products/route.ts
// Endpoint para listar todos los productos y crear uno nuevo

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Esquema de validación para la creación de productos
const productCreateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
  keywords: z
    .array(z.string())
    .or(z.string())
    .transform((val) =>
      typeof val === "string" ? val.split(",").map((k) => k.trim()) : val
    ),
  tone: z.string().min(1, "El tono es requerido"),
});

// GET - Obtener todos los productos del usuario
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Parámetros de paginación y ordenación
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const orderBy = searchParams.get("orderBy") || "updatedAt";
    const order = searchParams.get("order") || "desc";
    const search = searchParams.get("search") || "";

    // Calcular offset para paginación
    const skip = (page - 1) * limit;

    // Construir condiciones de búsqueda
    const where = {
      userId: session.user.id,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { category: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    // Obtener productos con conteo total para paginación
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: {
          [orderBy]: order === "asc" ? "asc" : "desc",
        },
        include: {
          descriptions: {
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Calcular metadata de paginación
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      products,
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore,
        hasPrev,
      },
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json(
      { message: "Error al obtener productos" },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo producto
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const json = await request.json();

    // Validar datos de entrada
    const result = productCreateSchema.safeParse(json);

    if (!result.success) {
      const formatted = result.error.format();
      return NextResponse.json(
        { message: "Datos inválidos", errors: formatted },
        { status: 400 }
      );
    }

    const { name, category, keywords, tone } = result.data;

    // Crear el producto
    const product = await prisma.product.create({
      data: {
        name,
        category,
        keywords, // Esto funciona porque keywords es de tipo Json en el schema
        tone,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { message: "Producto creado con éxito", product },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json(
      { message: "Error al crear producto" },
      { status: 500 }
    );
  }
}
