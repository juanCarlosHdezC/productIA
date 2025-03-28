// src/app/api/user/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Esquema para actualización de datos del usuario
const userUpdateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  email: z.string().email("Correo electrónico inválido").optional(),
  image: z.string().url().optional().nullable(),
});

// GET - Obtener datos del usuario actual
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Determinar si el usuario tiene una suscripción activa
    const isPro =
      user.stripeSubscriptionId &&
      user.stripeCurrentPeriodEnd &&
      new Date(user.stripeCurrentPeriodEnd) > new Date();

    // Calcular estadísticas básicas
    const stats = await prisma.$transaction([
      prisma.product.count({ where: { userId: user.id } }),
      prisma.description.count({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      user: {
        ...user,
        subscription: {
          isPro,
          currentPeriodEnd: user.stripeCurrentPeriodEnd,
          planId: user.stripePriceId,
        },
      },
      stats: {
        totalProducts: stats[0],
        totalDescriptions: stats[1],
      },
    });
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
    return NextResponse.json(
      { message: "Error al obtener datos del usuario" },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar datos del usuario
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const json = await request.json();

    // Validar datos de entrada
    const result = userUpdateSchema.safeParse(json);

    if (!result.success) {
      const formatted = result.error.format();
      return NextResponse.json(
        { message: "Datos inválidos", errors: formatted },
        { status: 400 }
      );
    }

    // Si se actualiza el email, verificar que no esté en uso
    if (result.data.email) {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: result.data.email,
          NOT: {
            id: session.user.id,
          },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { message: "El correo electrónico ya está en uso" },
          { status: 409 }
        );
      }
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: result.data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json({
      message: "Perfil actualizado con éxito",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    return NextResponse.json(
      { message: "Error al actualizar el perfil" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar cuenta de usuario
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Verificar si el usuario tiene una suscripción activa
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        stripeSubscriptionId: true,
        stripeCustomerId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Si el usuario tiene una suscripción activa, se debería cancelar en Stripe
    // Esta lógica depende de si quieres permitir eliminar cuentas con suscripciones activas
    if (user.stripeSubscriptionId) {
      // Aquí iría la lógica para cancelar la suscripción en Stripe
      // stripe.subscriptions.cancel(user.stripeSubscriptionId);
    }

    // Eliminar usuario (las relaciones se eliminarán en cascada según el schema)
    await prisma.user.delete({
      where: {
        id: session.user.id,
      },
    });

    return NextResponse.json({
      message: "Cuenta eliminada con éxito",
    });
  } catch (error) {
    console.error("Error al eliminar la cuenta:", error);
    return NextResponse.json(
      { message: "Error al eliminar la cuenta" },
      { status: 500 }
    );
  }
}
