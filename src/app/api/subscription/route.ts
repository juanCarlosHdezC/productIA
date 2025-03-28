// src/app/api/user/subscription/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { absoluteUrl } from "@/lib/utils";

// Esquema para cambio de plan
const changePlanSchema = z.object({
  priceId: z.string().min(1, "El ID del plan es requerido"),
});

// GET - Obtener estado de la suscripción
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
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        stripeCustomerId: true,
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

    // Si el usuario tiene una suscripción, obtener más detalles desde Stripe
    let subscriptionDetails = null;
    if (user.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          user.stripeSubscriptionId
        );

        subscriptionDetails = {
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        };
      } catch (error) {
        console.error(
          "Error al obtener detalles de suscripción de Stripe:",
          error
        );
        // No hacemos fallar la request si hay error al obtener detalles de Stripe
        // El front puede mostrar información limitada
      }
    }

    // Obtener los límites actuales según el plan
    const limits = isPro
      ? {
          maxDescriptionsPerMonth: 1000,
          maxVariantsPerGeneration: 5,
          advancedFeatures: true,
        }
      : {
          maxDescriptionsPerMonth: 50,
          maxVariantsPerGeneration: 2,
          advancedFeatures: false,
        };

    // Obtener uso actual para el mes en curso
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const descriptionsThisMonth = await prisma.description.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    return NextResponse.json({
      isPro,
      subscription: {
        ...user,
        details: subscriptionDetails,
      },
      limits,
      usage: {
        descriptionsThisMonth,
        percentUsed: Math.round(
          (descriptionsThisMonth / limits.maxDescriptionsPerMonth) * 100
        ),
      },
    });
  } catch (error) {
    console.error("Error al obtener estado de suscripción:", error);
    return NextResponse.json(
      { message: "Error al obtener estado de suscripción" },
      { status: 500 }
    );
  }
}

// POST - Crear sesión de checkout para cambiar de plan
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const json = await request.json();

    // Validar datos de entrada
    const result = changePlanSchema.safeParse(json);

    if (!result.success) {
      const formatted = result.error.format();
      return NextResponse.json(
        { message: "Datos inválidos", errors: formatted },
        { status: 400 }
      );
    }

    const { priceId } = result.data;

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Crear o recuperar el cliente de Stripe
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.name || undefined,
      });

      customerId = customer.id;

      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // URLs de retorno
    const returnUrl = absoluteUrl("/dashboard/settings/subscription");

    // Si el usuario ya tiene una suscripción, crear portal de cliente para gestionar
    if (user.stripeSubscriptionId) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return NextResponse.json({ url: portalSession.url });
    }

    // Si es una nueva suscripción, crear sesión de checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${returnUrl}?success=true`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error al procesar cambio de plan:", error);
    return NextResponse.json(
      { message: "Error al procesar cambio de plan" },
      { status: 500 }
    );
  }
}

// PATCH - Cancelar suscripción
export async function PATCH() {
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
        stripeSubscriptionId: true,
      },
    });

    if (!user?.stripeSubscriptionId) {
      return NextResponse.json(
        { message: "No tienes una suscripción activa" },
        { status: 400 }
      );
    }

    // Cancelar la suscripción en Stripe
    // Nota: Esto no cancela inmediatamente, sino al final del período de facturación
    const subscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    return NextResponse.json({
      message: "Suscripción cancelada con éxito",
      subscription: {
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  } catch (error) {
    console.error("Error al cancelar la suscripción:", error);
    return NextResponse.json(
      { message: "Error al cancelar la suscripción" },
      { status: 500 }
    );
  }
}
