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
  const dailyAllowance = user.descriptionQuota / daysInMonth;

  let descriptionsToday = user.descriptionsToday;

  if (!lastReset || differenceInCalendarDays(today, lastReset) > 0) {
    descriptionsToday = 0; // se reinicia si es nuevo día
  }

  return NextResponse.json({
    plan: user.plan,
    dailyLimit: Math.floor(dailyAllowance),
    remainingToday: Math.max(Math.floor(dailyAllowance - descriptionsToday), 0),
    monthlyLimit: user.descriptionQuota,
    remainingMonth: Math.max(user.descriptionQuota - user.descriptionsUsed, 0),
  });
}
