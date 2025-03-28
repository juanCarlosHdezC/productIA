"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Loader2,
  Download,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

// Tipos para los datos de facturación
interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  downloadUrl?: string;
}

interface Subscription {
  id: string;
  plan: "free" | "basic" | "pro";
  status: "active" | "canceled" | "past_due";
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentMethod?: {
    type: "card";
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  };
}

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [changingPlan, setChangingPlan] = useState(false);
  const [cancelingSubscription, setCancelingSubscription] = useState(false);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/billing");

        if (!response.ok) {
          throw new Error("Error al cargar los datos de facturación");
        }

        const data = await response.json();
        setSubscription(data.subscription);
        setInvoices(data.invoices);
      } catch (error) {
        console.error("Error fetching billing data:", error);
        toast.error("No se pudieron cargar los datos de facturación");
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  const handleChangePlan = async () => {
    try {
      setChangingPlan(true);
      // Redireccionar a la página de precios
      router.push("/pricing");
    } catch (error) {
      toast.error("Error al cambiar de plan");
    } finally {
      setChangingPlan(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCancelingSubscription(true);

      const response = await fetch("/api/billing/subscription", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "cancel" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al cancelar la suscripción");
      }

      // Actualizar el estado local
      if (subscription) {
        setSubscription({
          ...subscription,
          cancelAtPeriodEnd: true,
        });
      }

      toast.success("Tu suscripción se cancelará al final del período actual");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error al cancelar la suscripción");
      }
    } finally {
      setCancelingSubscription(false);
    }
  };

  const handleResumeSubscription = async () => {
    try {
      setCancelingSubscription(true);

      const response = await fetch("/api/billing/subscription", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "resume" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al reactivar la suscripción");
      }

      // Actualizar el estado local
      if (subscription) {
        setSubscription({
          ...subscription,
          cancelAtPeriodEnd: false,
        });
      }

      toast.success("Tu suscripción ha sido reactivada");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error al reactivar la suscripción");
      }
    } finally {
      setCancelingSubscription(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Facturación</h2>
        <Button variant="outline" asChild>
          <Link href="/pricing">Ver planes</Link>
        </Button>
      </div>

      <Tabs defaultValue="subscription" className="space-y-6">
        <TabsList>
          <TabsTrigger value="subscription">Suscripción</TabsTrigger>
          <TabsTrigger value="invoices">Historial de pagos</TabsTrigger>
          <TabsTrigger value="payment-method">Método de pago</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tu plan actual</CardTitle>
              <CardDescription>
                Gestiona tu suscripción y periodos de facturación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {subscription ? (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold">
                        Plan{" "}
                        {subscription.plan === "free"
                          ? "Gratuito"
                          : subscription.plan === "basic"
                          ? "Básico"
                          : "Pro"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {subscription.plan === "free"
                          ? "Plan limitado con 3 descripciones"
                          : subscription.plan === "basic"
                          ? "100 descripciones por mes, análisis SEO básico"
                          : "Generación ilimitada, análisis SEO avanzado, prioridad"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        subscription.status === "active"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {subscription.status === "active"
                        ? "Activo"
                        : subscription.status === "canceled"
                        ? "Cancelado"
                        : "Pendiente de pago"}
                    </Badge>
                  </div>

                  {subscription.plan !== "free" && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium">
                          Detalles de facturación
                        </h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Próximo cobro
                            </span>
                            <span className="font-medium">
                              {subscription.cancelAtPeriodEnd
                                ? "No se renovará"
                                : formatDate(subscription.currentPeriodEnd)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Importe
                            </span>
                            <span className="font-medium">
                              {subscription.plan === "basic"
                                ? "9,99 €"
                                : "29,99 €"}{" "}
                              / mes
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    No tienes ninguna suscripción activa
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/pricing">Ver planes disponibles</Link>
                  </Button>
                </div>
              )}
            </CardContent>
            {subscription && subscription.plan !== "free" && (
              <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 items-stretch">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleChangePlan}
                  disabled={changingPlan}
                >
                  {changingPlan ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Cambiar de plan"
                  )}
                </Button>
                {subscription.cancelAtPeriodEnd ? (
                  <Button
                    className="flex-1"
                    onClick={handleResumeSubscription}
                    disabled={cancelingSubscription}
                  >
                    {cancelingSubscription ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Reactivar suscripción"
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleCancelSubscription}
                    disabled={cancelingSubscription}
                  >
                    {cancelingSubscription ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Cancelar suscripción"
                    )}
                  </Button>
                )}
              </CardFooter>
            )}
          </Card>

          {subscription && subscription.cancelAtPeriodEnd && (
            <Card className="border-amber-300 dark:border-amber-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Tu suscripción finalizará pronto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tu suscripción se cancelará automáticamente el{" "}
                  {formatDate(subscription.currentPeriodEnd)}. Hasta entonces,
                  puedes seguir disfrutando de todas las ventajas de tu plan.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Historial de pagos</CardTitle>
              <CardDescription>
                Revisa tus facturas y pagos anteriores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          {invoice.status === "paid" ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : invoice.status === "pending" ? (
                            <Clock className="h-5 w-5 text-amber-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{invoice.number}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(invoice.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">
                            {invoice.amount.toFixed(2)} €
                          </p>
                          <Badge
                            variant={
                              invoice.status === "paid"
                                ? "default"
                                : invoice.status === "pending"
                                ? "outline"
                                : "destructive"
                            }
                            className="mt-1"
                          >
                            {invoice.status === "paid"
                              ? "Pagado"
                              : invoice.status === "pending"
                              ? "Pendiente"
                              : "Fallido"}
                          </Badge>
                        </div>
                        {invoice.downloadUrl && invoice.status === "paid" && (
                          <Button variant="outline" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No hay facturas disponibles todavía
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-method">
          <Card>
            <CardHeader>
              <CardTitle>Método de pago</CardTitle>
              <CardDescription>
                Gestiona tus métodos de pago guardados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscription?.paymentMethod ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-background p-2 border rounded-md">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">
                        {subscription.paymentMethod.brand} terminada en{" "}
                        {subscription.paymentMethod.last4}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expira {subscription.paymentMethod.expiryMonth}/
                        {subscription.paymentMethod.expiryYear}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Actualizar método de pago</Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No hay métodos de pago guardados
                  </p>
                  <Button className="mt-4">Añadir método de pago</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
