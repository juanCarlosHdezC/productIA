import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { checkSubscription } from "@/utils/subscription";
import PricingPage from "./pricingPage";

export default async function PricingServer() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/pricing");
  }

  // Obtener estado de suscripción desde el servidor
  const isPro = await checkSubscription(session.user.id);

  const userPlan = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      plan: true,
    },
  });

  return (
    <PricingPage
      isPro={isPro}
      plan={userPlan?.plan}
      basicPlanId={process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_ID ?? ""}
      proPlanId={process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_ID ?? ""}
    />
  );
}
