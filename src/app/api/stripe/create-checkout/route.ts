// 10. Crear sesión de pago con Stripe
// src/app/api/stripe/create-checkout/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession({ req, ...authOptions });
    const body = await req.json();
    const { priceId } = body;

    if (!session?.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!priceId) {
      return NextResponse.json(
        { error: "El priceId es requerido" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Crear o recuperar el cliente de Stripe
    let customerId =
      user.stripeCustomerId ??
      (
        await stripe.customers.create({
          email: user.email!,
          name: user.name || undefined,
        })
      ).id;

    if (!user.stripeCustomerId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Crear una sesión de checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/payment/success?plan=${priceId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Error en create-checkout:", error);

    // 🛠️ Mejor manejo de errores
    if (error.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        { error: "Error en Stripe: " + error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
