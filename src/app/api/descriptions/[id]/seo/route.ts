// src/app/api/descriptions/[id]/seo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeSEO } from "@/lib/seo-analyzer";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const descriptionId = params.id;

    // Verificar que la descripción existe y pertenece al usuario
    const description = await prisma.description.findUnique({
      where: { id: descriptionId },
      include: { product: true },
    });

    if (!description) {
      return NextResponse.json(
        { error: "Descripción no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la descripción pertenece al usuario
    if (description.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para analizar esta descripción" },
        { status: 403 }
      );
    }

    // Verificar el plan del usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    // Si necesitas verificar la suscripción, asegúrate de que exista el modelo
    // y relación correspondiente en tu esquema de Prisma
    // Por ahora, asumimos que todos los usuarios pueden usar esta función

    // Si tienes un campo para el plan en el modelo User, puedes verificarlo así:
    // if (user?.plan !== "pro" && user?.plan !== "basic") {
    //   return NextResponse.json(
    //     { error: "Necesitas una suscripción activa para usar esta función" },
    //     { status: 403 }
    //   );
    // }

    // Realizar el análisis SEO
    const seoAnalysis = await analyzeSEO(descriptionId);

    return NextResponse.json({ data: seoAnalysis });
  } catch (error) {
    console.error("Error en el análisis SEO:", error);
    return NextResponse.json(
      { error: "Error al realizar el análisis SEO" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const descriptionId = params.id;

    // Verificar que la descripción existe y pertenece al usuario
    const description = await prisma.description.findUnique({
      where: { id: descriptionId },
      include: {
        product: true,
        seoAnalysis: true,
      },
    });

    if (!description) {
      return NextResponse.json(
        { error: "Descripción no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que el producto pertenece al usuario
    const product = await prisma.product.findUnique({
      where: {
        id: description.productId,
        userId: session.user.id,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "No tienes permiso para acceder a esta descripción" },
        { status: 403 }
      );
    }

    // Si no hay análisis SEO, devolver un error
    if (!description.seoAnalysis) {
      return NextResponse.json(
        { error: "No hay análisis SEO para esta descripción" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: description.seoAnalysis });
  } catch (error) {
    console.error("Error al obtener el análisis SEO:", error);
    return NextResponse.json(
      { error: "Error al obtener el análisis SEO" },
      { status: 500 }
    );
  }
}
