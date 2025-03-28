import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function GET(req: NextRequest) {
  try {
    // Verificar la autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
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

    // Verificar si el usuario tiene un ID de cliente de Stripe
    if (!user.stripeCustomerId) {
      return NextResponse.json({
        subscription: null,
        invoices: [],
        paymentMethod: null,
      });
    }

    // Obtener la suscripción del usuario
    let subscriptionData = null;
    if (user.stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(
        user.stripeSubscriptionId
      );

      // Determinar el plan
      let plan: "free" | "basic" | "pro" = "free";
      if (
        subscription.items.data[0].price.id ===
        process.env.STRIPE_BASIC_PRICE_ID
      ) {
        plan = "basic";
      } else if (
        subscription.items.data[0].price.id === process.env.STRIPE_PRO_PRICE_ID
      ) {
        plan = "pro";
      }

      subscriptionData = {
        id: subscription.id,
        plan,
        status: subscription.status,
        currentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    }

    // Obtener el historial de facturas
    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 10, // Limitar a las 10 facturas más recientes
    });

    const invoicesData = invoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      date: new Date(invoice.created * 1000).toISOString(),
      amount: invoice.amount_paid / 100, // Convertir de centavos a euros
      status: invoice.status,
      downloadUrl: invoice.invoice_pdf,
    }));

    // Obtener el método de pago predeterminado
    let paymentMethodData = null;
    if (subscriptionData) {
      try {
        const paymentMethods = await stripe.paymentMethods.list({
          customer: user.stripeCustomerId,
          type: "card",
        });

        if (paymentMethods.data.length > 0) {
          const paymentMethod = paymentMethods.data[0];

          if (paymentMethod.type === "card" && paymentMethod.card) {
            paymentMethodData = {
              id: paymentMethod.id,
              type: paymentMethod.type,
              last4: paymentMethod.card.last4,
              brand: paymentMethod.card.brand,
              expiryMonth: paymentMethod.card.exp_month,
              expiryYear: paymentMethod.card.exp_year,
            };
          }
        }
      } catch (error) {
        console.error("Error al obtener el método de pago:", error);
      }
    }

    return NextResponse.json({
      subscription: subscriptionData,
      invoices: invoicesData,
      paymentMethod: paymentMethodData,
    });
  } catch (error) {
    console.error("Error al obtener los datos de facturación:", error);
    return NextResponse.json(
      { error: "Error al obtener los datos de facturación" },
      { status: 500 }
    );
  }
}
