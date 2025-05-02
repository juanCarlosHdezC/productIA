import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { differenceInCalendarDays, startOfDay } from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return new NextResponse("Usuario no encontrado", { status: 404 });
  }

  const today = startOfDay(new Date());
  const lastReset = user.dailyResetDate
    ? startOfDay(user.dailyResetDate)
    : null;
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();

  const dailyLimit = Math.floor(user.tokenQuota / daysInMonth);
  let tokensToday = user.tokensToday;

  if (!lastReset || differenceInCalendarDays(today, lastReset) > 0) {
    tokensToday = 0;
  }

  return NextResponse.json({
    plan: user.plan,
    dailyTokenLimit: dailyLimit,
    remainingToday: Math.max(dailyLimit - tokensToday, 0),
    monthlyTokenLimit: user.tokenQuota,
    remainingMonth: Math.max(user.tokenQuota - user.tokensUsed, 0),
  });
}
