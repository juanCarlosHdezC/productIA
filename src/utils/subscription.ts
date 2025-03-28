import { prisma } from "@/lib/prisma";

export async function checkSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      plan: true,
    },
  });

  if (!user) {
    return false;
  }

  const isSubscribed =
    user.stripeSubscriptionId &&
    user.stripeCurrentPeriodEnd &&
    user.stripeCurrentPeriodEnd.getTime() > Date.now();

  return !!isSubscribed;
}
