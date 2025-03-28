// src/app/dashboard/settings/subscription/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  CreditCard,
  Loader2,
  Zap,
  Key,
  Sparkles,
  User2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [limits, setLimits] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);

  // Verificar parámetros de URL para notificaciones
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Suscripción actualizada", {
        description: "¡Tu suscripción ha sido actualizada exitosamente!",
      });
    }

    if (searchParams.get("canceled") === "true") {
      toast.info("Proceso cancelado", {
        description: "Has cancelado el proceso de cambio de suscripción.",
      });
    }
  }, [searchParams]);

  // Cargar datos de suscripción
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const response = await fetch("/api/user/subscription");

        if (!response.ok) {
          throw new Error("No se pudo cargar la información de suscripción");
        }

        const data = await response.json();
        setSubscription(data.subscription);
        setLimits(data.limits);
        setUsage(data.usage);
      } catch (error) {
        console.error("Error al cargar suscripción:", error);
        toast.error("Error al cargar suscripción", {
          description:
            "No se pudo obtener la información de tu suscripción. Inténtalo nuevamente.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  // Manejar cambio de plan
  const handleChangePlan = async (priceId: string) => {
    setIsActionLoading(true);

    try {
      const response = await fetch("/api/user/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error("Error al procesar cambio de plan");
      }

      const data = await response.json();

      // Redirigir a Stripe Checkout o Portal
      window.location.href = data.url;
    } catch (error) {
      console.error("Error al cambiar plan:", error);
      toast.error("Error al cambiar plan", {
        description:
          "No se pudo procesar tu solicitud de cambio de plan. Inténtalo nuevamente.",
      });
      setIsActionLoading(false);
    }
  };

  // Manejar cancelación de suscripción
  const handleCancelSubscription = async () => {
    setIsActionLoading(true);

    try {
      const response = await fetch("/api/user/subscription", {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Error al cancelar suscripción");
      }

      const data = await response.json();

      // Actualizar datos locales
      setSubscription({
        ...subscription,
        details: {
          ...subscription.details,
          cancelAtPeriodEnd: true,
          currentPeriodEnd: data.subscription.currentPeriodEnd,
        },
      });

      toast.success("Suscripción cancelada", {
        description:
          "Tu suscripción será cancelada al final del período de facturación actual.",
      });
    } catch (error) {
      console.error("Error al cancelar suscripción:", error);
      toast.error("Error al cancelar suscripción", {
        description:
          "No se pudo procesar tu solicitud de cancelación. Inténtalo nuevamente.",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // Si está cargando, mostrar estado de carga
  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Suscripción"
          text="Administra tu plan y facturación."
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/settings")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Configuración
          </Button>
        </DashboardHeader>

        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardShell>
    );
  }

  const isPro =
    subscription?.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_ID;
  const isCanceled = subscription?.details?.cancelAtPeriodEnd;

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Suscripción"
        text="Administra tu plan y facturación."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/settings")}
          disabled={isActionLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Configuración
        </Button>
      </DashboardHeader>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <Zap className="mr-2 h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="plans">
            <Sparkles className="mr-2 h-4 w-4" />
            Planes
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="mr-2 h-4 w-4" />
            Facturación
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span>Estado de tu suscripción</span>
                  {isCanceled && (
                    <Badge
                      variant="outline"
                      className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    >
                      Cancelación Programada
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Información sobre tu plan actual y uso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-bold">
                      Plan {isPro ? "Pro" : "Básico"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isPro
                        ? "Acceso a todas las funcionalidades premium."
                        : "Plan básico con funcionalidades limitadas."}
                    </p>
                  </div>

                  {subscription?.stripeCurrentPeriodEnd && (
                    <div className="flex items-center rounded-md border p-4">
                      <Calendar className="mr-3 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {isCanceled
                            ? "Tu plan finaliza el:"
                            : "Próxima facturación:"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(subscription.stripeCurrentPeriodEnd)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Uso del mes actual</h4>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Descripciones generadas</span>
                      <span className="font-medium">
                        {usage?.descriptionsThisMonth || 0} de{" "}
                        {limits?.maxDescriptionsPerMonth || 0}
                      </span>
                    </div>
                    <Progress value={usage?.percentUsed || 0} />
                  </div>

                  <div className="rounded-md bg-muted p-4">
                    <div className="flex items-start space-x-4">
                      <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h5 className="text-sm font-medium">
                          Información de uso
                        </h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          {isPro
                            ? "Con tu plan Pro, puedes generar hasta 5 variantes por cada producto y acceder a todas las funciones premium."
                            : "Con tu plan Básico, estás limitado a 2 variantes por generación. Actualiza a Pro para disfrutar de más funcionalidades."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
                {isCanceled ? (
                  <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                    <span>
                      Tu suscripción será cancelada el{" "}
                      {formatDate(subscription?.stripeCurrentPeriodEnd)}.
                    </span>
                    <Button
                      onClick={() =>
                        handleChangePlan(
                          isPro
                            ? process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_ID!
                            : process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_ID!
                        )
                      }
                      disabled={isActionLoading}
                    >
                      {isActionLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        "Reactivar suscripción"
                      )}
                    </Button>
                  </div>
                ) : isPro ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" disabled={isActionLoading}>
                        Cancelar Suscripción
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          ¿Seguro que quieres cancelar?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Al cancelar tu suscripción Pro, perderás acceso a
                          todas las funcionalidades premium cuando finalice tu
                          período de facturación actual.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex items-center justify-start space-x-2 rounded-md border border-yellow-200 bg-yellow-100/50 p-4">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <p className="text-sm text-yellow-700">
                          Tu plan seguirá activo hasta{" "}
                          {formatDate(subscription?.stripeCurrentPeriodEnd)}.
                        </p>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isActionLoading}>
                          Mantener suscripción
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancelSubscription}
                          disabled={isActionLoading}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isActionLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Procesando...
                            </>
                          ) : (
                            "Confirmar cancelación"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button
                    onClick={() =>
                      handleChangePlan(
                        process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_ID!
                      )
                    }
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Actualizar a Pro
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() =>
                    handleChangePlan(
                      subscription?.stripeCustomerId
                        ? "customer_portal"
                        : process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_ID!
                    )
                  }
                  disabled={isActionLoading}
                >
                  {isActionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : subscription?.stripeCustomerId ? (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Gestionar método de pago
                    </>
                  ) : (
                    "Comenzar suscripción"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Características incluidas</CardTitle>
                <CardDescription>
                  Funcionalidades de tu {isPro ? "Plan Pro" : "Plan Básico"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>
                    {isPro
                      ? "Descripciones ilimitadas"
                      : "Hasta 50 descripciones al mes"}
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>
                    {isPro
                      ? "Hasta 5 opciones por generación"
                      : "2 opciones por generación"}
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>
                    {isPro
                      ? "Bullets points para productos"
                      : "Formato básico de descripción"}
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>{isPro ? "Análisis SEO básico" : "Sin análisis SEO"}</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>
                    {isPro ? "Historial ilimitado" : "Historial de 30 días"}
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>{isPro ? "Soporte prioritario" : "Soporte por email"}</p>
                </div>
                {!isPro && (
                  <Button
                    className="w-full mt-4"
                    onClick={() =>
                      handleChangePlan(
                        process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_ID!
                      )
                    }
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Actualizar a Pro"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans">
          <div className="grid gap-6 sm:grid-cols-2">
            <Card className={!isPro ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle>Plan Básico</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">9.99€</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>Hasta 50 descripciones por mes</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>2 opciones por generación</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>Historial de 30 días</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>Soporte por email</p>
                </div>
              </CardContent>
              <CardFooter>
                {!isPro ? (
                  <Button className="w-full" variant="outline" disabled>
                    Tu plan actual
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() =>
                      handleChangePlan(
                        process.env.NEXT_PUBLIC_STRIPE_BASIC_PLAN_ID!
                      )
                    }
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Cambiar a Básico"
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>

            <Card className={isPro ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle>Plan Pro</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">29.99€</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>Descripciones ilimitadas</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>5 opciones por generación</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>Historial ilimitado</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>Bullets points para productos</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>Análisis SEO básico</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>Soporte prioritario</p>
                </div>
              </CardContent>
              <CardFooter>
                {isPro ? (
                  <Button className="w-full" disabled>
                    Tu plan actual
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() =>
                      handleChangePlan(
                        process.env.NEXT_PUBLIC_STRIPE_PRO_PLAN_ID!
                      )
                    }
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Actualizar a Pro"
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Historial de facturación</CardTitle>
              <CardDescription>
                Accede a tus facturas y método de pago.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscription?.stripeCustomerId ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Para ver tu historial de facturas o actualizar tu método de
                    pago, accede al portal de cliente de Stripe.
                  </p>
                  <Button
                    onClick={() => handleChangePlan("customer_portal")}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Acceder al portal de facturación
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">
                    No hay historial de facturación
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    Aún no tienes una suscripción activa. Actualiza a un plan de
                    pago para ver tu historial de facturación.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push("/pricing")}
                  >
                    Ver planes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
