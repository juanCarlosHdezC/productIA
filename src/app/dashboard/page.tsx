// src/app/dashboard/page.tsx

import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkSubscription } from "@/utils/subscription";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  Clock,
  Edit3,
  GitBranch,
  History,
  LayoutGrid,
  Plus,
  TextIcon,
  TrendingUp,
} from "lucide-react";
import { DescriptionGenerator } from "@/components/description-generator";
import { RecentActivityList } from "@/components/dashboard/recent-activity";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProductsGrid } from "@/components/dashboard/products-grid";
import { UsageInfo } from "@/components/ui/usageInfo";
import { SeoScore } from "@/components/description-generator/seo-score";

async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    redirect("/login");
  }

  const isPro = await checkSubscription(session.user.id);

  // Fetch user plan
  const userPlan = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  // Obtener estadísticas básicas
  const totalProductsCount = await prisma.product.count({
    where: {
      userId: session.user.id,
    },
  });

  const totalDescriptionsCount = await prisma.description.count({
    where: {
      userId: session.user.id,
    },
  });

  // Obtener productos recientes
  const recentProducts = await prisma.product.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 3,
    include: {
      descriptions: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text={`Bienvenido de nuevo, ${session.user.name || "Usuario"}.`}
      >
        <Link href="/dashboard/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </Link>
      </DashboardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCards
          totalProducts={totalProductsCount}
          totalDescriptions={totalDescriptionsCount}
          isPro={isPro}
          plan={userPlan?.plan || "Básico"}
        />
        <UsageInfo />
      </div>
      <SeoScore descriptionId="cm9gnx5ck0003tjiclslnvl08" />
      <Tabs defaultValue="generator" className="mt-6 space-y-4">
        <TabsList>
          <TabsTrigger value="generator">
            <TextIcon className="mr-2 h-4 w-4" />
            Generador
          </TabsTrigger>
          <TabsTrigger value="products">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Productos Recientes
          </TabsTrigger>
          <TabsTrigger value="activity">
            <History className="mr-2 h-4 w-4" />
            Actividad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generador de Descripciones</CardTitle>
              <CardDescription>
                Crea descripciones de productos convincentes optimizadas para
                SEO con un solo clic.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-40">
                    Cargando generador...
                  </div>
                }
              >
                <DescriptionGenerator isPro={isPro} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <ProductsGrid
            products={recentProducts}
            emptyState={
              <Card className="flex flex-col items-center justify-center p-8 text-center h-[400px]">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <GitBranch className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="mt-6 text-xl font-semibold">
                  No tienes productos aún
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm">
                  Comienza creando tu primer producto para generar descripciones
                  convincentes.
                </p>
                <Link href="/dashboard/new" className="mt-6">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primer Producto
                  </Button>
                </Link>
              </Card>
            }
          />

          {recentProducts.length > 0 && (
            <div className="flex justify-center mt-4">
              <Link href="/dashboard/products">
                <Button variant="outline">Ver todos los productos</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="mr-2 h-5 w-5" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>
                Revisa tus últimas acciones y modificaciones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivityList userId={session.user.id} />
            </CardContent>
            <CardFooter>
              <Link href="/dashboard/history" className="w-full">
                <Button variant="outline" className="w-full">
                  Ver historial completo
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="spaceus-y-1">
              <CardTitle>Consejos SEO</CardTitle>
              <CardDescription>
                Optimiza tus descripciones de producto
              </CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>
                Incluye palabras clave relevantes al inicio de la descripción
              </li>
              <li>Mantén un equilibro entre texto persuasivo e informativo</li>
              <li>
                Usa párrafos cortos y bullet points para mejorar la legibilidad
              </li>
              <li>Incluye especificaciones técnicas precisas del producto</li>
              <li>Destaca los beneficios, no solo las características</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link
              href="https://blog.describeia.com/seo-tips"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Leer más consejos SEO →
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Aprovecha tu Plan {userPlan?.plan}</CardTitle>
              <CardDescription>
                {isPro
                  ? "Saca el máximo partido a tus funciones premium"
                  : "Mejora tu plan para desbloquear más funciones"}
              </CardDescription>
            </div>
            {isPro ? (
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <CalendarDays className="h-5 w-5" />
              </div>
            ) : (
              <div className="rounded-full bg-muted p-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </CardHeader>
          <CardContent>
            {userPlan?.plan === "Pro" ? (
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  <span className="font-medium">Hasta 5 variantes</span> por
                  cada generación
                </li>
                <li>
                  Acceso a <span className="font-medium">bullet points</span>{" "}
                  optimizados
                </li>
                <li>Edición avanzada de descripciones</li>
                <li>Análisis SEO y readability score</li>
                <li>Integración con plataformas de e-commerce</li>
              </ul>
            ) : userPlan?.plan === "Básico" ? (
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  Actualmente tienes{" "}
                  <span className="font-medium">2 variantes</span> por
                  generación
                </li>
                <li>
                  Actualiza para obtener{" "}
                  <span className="font-medium">hasta 5 variantes</span>
                </li>
                <li>Desbloquea bullet points automáticos</li>
                <li>Accede a análisis SEO avanzado</li>
                <li>Historial ilimitado de descripciones</li>
              </ul>
            ) : userPlan?.plan === "Gratis" ? (
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  Actualmente tienes{" "}
                  <span className="font-medium">1 variantes</span> por
                  generación
                </li>
                <li>
                  Actualiza para obtener{" "}
                  <span className="font-medium">hasta 2 variantes</span>
                </li>
                <li>Desbloquea bullet points automáticos</li>
                <li>Accede a análisis SEO avanzado</li>
                <li>Historial ilimitado de descripciones</li>
              </ul>
            ) : null}
          </CardContent>
          <CardFooter>
            {userPlan?.plan === "Pro" ? (
              <Link href="/dashboard/settings" className="w-full">
                <Button variant="outline" className="w-full">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Administrar Suscripción
                </Button>
              </Link>
            ) : userPlan?.plan === "Basico" ? (
              <Link href="/pricing" className="w-full">
                <Button className="w-full">Actualizar a Pro</Button>
              </Link>
            ) : userPlan?.plan === "Gratis" ? (
              <Link href="/pricing" className="w-full">
                <Button className="w-full">Actualizar a Basico</Button>
              </Link>
            ) : null}
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  );
}

export default DashboardPage;
