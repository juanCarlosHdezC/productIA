// src/app/api/stripe/webhook/route.ts
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { string } from "zod";

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
    const subscriptionData: {
      stripeSubscriptionId: string;
      stripeCustomerId: string;
      stripePriceId: string;
      stripeCurrentPeriodEnd: Date;
      plan?: string;
      tokenQuota?: number;
    } = {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    };

    const plan =
      subscriptionData.stripePriceId ===
      process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_ID
        ? "Pro"
        : subscriptionData.stripePriceId ===
          process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_ID
        ? "Básico"
        : "Gratis";

    const tokenQuota =
      plan === "Pro" ? 5000000 : plan === "Básico" ? 1500000 : 300000;

    subscriptionData.plan = plan;

    subscriptionData.tokenQuota = tokenQuota;

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
          plan: subscriptionData.plan,
          tokenQuota: subscriptionData.tokenQuota,
          tokensToday: 0,
          tokensUsed: 0,
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
