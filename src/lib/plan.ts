import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

interface UserPlan {
  plan: string;
}

export const UserPlan = async () => {
  const session = await getServerSession(authOptions);

  const userPlan = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: { plan: true },
  });

  return userPlan?.plan ?? null;
};
