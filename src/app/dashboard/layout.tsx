import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkSubscription } from "@/utils/subscription";
import { MainNav } from "@/components/dashboard/main-nav";
import { UserAccountNav } from "@/components/dashboard/user-account-nav";
import { SiteFooter } from "@/components/dashboard/site-footer";
import { MobileNav } from "@/components/dashboard/mobile-nav";

export const metadata: Metadata = {
  title: "Dashboard | DescribeAI",
  description:
    "Genera descripciones de producto con IA para aumentar tus ventas.",
};

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const isPro = await checkSubscription(session.user.id);
  const userPlan = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav />
          <div className="hidden md:flex items-center gap-6">
            {userPlan?.plan === "Basico" ? (
              <Link
                href="/pricing"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Actualizar a Pro
              </Link>
            ) : userPlan?.plan === "Pro" ? (
              <Link
                href="/dashboard/settings"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Administra tu plan
              </Link>
            ) : null}
            <UserAccountNav
              user={{
                name: session.user.name,
                image: session.user.image,
                email: session.user.email,
              }}
            />
          </div>
          <MobileNav
            isPro={isPro}
            user={{
              name: session.user.name,
              image: session.user.image,
              email: session.user.email,
            }}
          />
        </div>
      </header>
      <main className="flex-1 container py-6 md:py-10">{children}</main>
      <SiteFooter />
    </div>
  );
}
