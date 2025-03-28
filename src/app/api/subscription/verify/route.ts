import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Ruta para cancelar o reactivar una suscripción
export async function PATCH(req: NextRequest) {
  try {
    // Verificar la autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener los datos de la solicitud
    const { action } = await req.json();

    if (!action || (action !== "cancel" && action !== "resume")) {
      return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
    }

    // Obtener el ID del usuario
    const userId = session.user.id;

    // Obtener el usuario de la base de datos
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "Usuario sin suscripción" },
        { status: 404 }
      );
    }

    // Cancelar o reactivar la suscripción en Stripe
    if (action === "cancel") {
      // Cancelar al final del período actual
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      return NextResponse.json({
        message: "Suscripción configurada para cancelarse al final del período",
        success: true,
      });
    } else {
      // Reactivar la suscripción
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });

      return NextResponse.json({
        message: "Suscripción reactivada correctamente",
        success: true,
      });
    }
  } catch (error) {
    console.error("Error al gestionar la suscripción:", error);
    return NextResponse.json(
      { error: "Error al gestionar la suscripción" },
      { status: 500 }
    );
  }
}

// Ruta para cambiar de plan
export async function POST(req: NextRequest) {
  try {
    // Verificar la autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener los datos de la solicitud
    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "ID de precio no proporcionado" },
        { status: 400 }
      );
    }

    // Obtener el ID del usuario
    const userId = session.user.id;

    // Obtener el usuario de la base de datos
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si el usuario ya tiene una suscripción
    if (user.stripeSubscriptionId) {
      // Actualizar la suscripción existente
      const subscription = await stripe.subscriptions.retrieve(
        user.stripeSubscriptionId
      );

      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: false,
        proration_behavior: "create_prorations",
        items: [
          {
            id: subscription.items.data[0].id,
            price: priceId,
          },
        ],
      });

      // Actualizar el precio en la base de datos
      await prisma.user.update({
        where: { id: userId },
        data: { stripePriceId: priceId },
      });

      return NextResponse.json({
        message: "Plan actualizado correctamente",
        success: true,
      });
    } else {
      // El usuario no tiene una suscripción, crear una nueva
      // Esta situación normalmente se manejaría a través de Checkout Sessions
      return NextResponse.json(
        {
          error:
            "Usuario sin suscripción. Usa el flujo de Checkout para crear una nueva.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error al cambiar de plan:", error);
    return NextResponse.json(
      { error: "Error al cambiar de plan" },
      { status: 500 }
    );
  }
}
