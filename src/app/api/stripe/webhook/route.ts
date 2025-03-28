// src/app/api/stripe/webhook/route.ts
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const signature = (await headers()).get("stripe-signature");
    if (!signature) throw new Error("Firma del webhook no encontrada");

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("✅ Evento recibido:", event.type);

    const session = event.data.object as Stripe.Checkout.Session;
    if (!session?.subscription || !session.metadata?.userId) {
      throw new Error("Datos incompletos en la sesión de Stripe");
    }

    // Recuperar la suscripción desde Stripe
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    const userId = session.metadata.userId;
    const subscriptionData = {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    };

    if (event.type === "checkout.session.completed") {
      await prisma.user.update({
        where: { id: userId },
        data: subscriptionData,
      });
      console.log("✅ Usuario actualizado con nueva suscripción:", userId);
    } else if (event.type === "invoice.payment_succeeded") {
      await prisma.user.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          stripePriceId: subscriptionData.stripePriceId,
          stripeCurrentPeriodEnd: subscriptionData.stripeCurrentPeriodEnd,
        },
      });
      console.log(
        "✅ Suscripción actualizada tras pago exitoso:",
        subscription.id
      );
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ Error en Webhook:", error.message);
    return new NextResponse(`Error: ${error.message}`, { status: 400 });
  }
}
