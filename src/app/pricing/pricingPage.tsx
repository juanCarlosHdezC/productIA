"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

interface PricingPageProps {
  isPro: boolean;
  basicPlanId: string;
  proPlanId: string;
  plan: string;
}

export default function PricingPage({
  isPro,
  basicPlanId,
  proPlanId,
  plan,
}: PricingPageProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout(priceId: string) {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      if (!res.ok) throw new Error("Error al crear la sesión de pago");

      const { url } = await res.json();
      window.location.href = url; // Redirige a Stripe
    } catch (error) {
      console.error("Error en checkout:", error);
      alert("No se pudo procesar el pago");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-md text-center mb-10">
        <h1 className="text-3xl font-bold">Planes de suscripción</h1>
        <p className="mt-2 text-muted-foreground">
          Elige el plan perfecto para tu negocio
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
        {/* Free Básico */}
        <Card className={isPro ? "opacity-70" : ""}>
          <CardHeader>
            <CardTitle className="text-xl">Gratis</CardTitle>
            <CardDescription>Para usuarios principiantes</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">0$</span>
              <span className="text-muted-foreground ml-1">/mes</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Hasta 20 descripciones por mes
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>1 opcion por generación</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Historial de 7 días</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {plan === "Gratis" ? (
              <Button variant="outline" className="w-full" disabled>
                Tu plan actual
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleCheckout(basicPlanId)}
                disabled={loading}
              >
                {loading ? "Cargando..." : "Comenzar"}
              </Button>
            )}
          </CardFooter>
        </Card>
        {/* Plan Básico */}
        <Card className={isPro ? "opacity-70" : ""}>
          <CardHeader>
            <CardTitle className="text-xl">Básico</CardTitle>
            <CardDescription>Para pequeños negocios</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">9.99$</span>
              <span className="text-muted-foreground ml-1">/mes</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Hasta 50 descripciones por mes
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>2 opciones por generación</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Historial de 30 días</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Soporte por email
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {plan === "Basico" ? (
              <Button variant="outline" className="w-full" disabled>
                Tu plan actual
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => handleCheckout(basicPlanId)}
                disabled={loading}
              >
                {loading ? "Cargando..." : "Actualizar a Basico"}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Plan Pro */}
        <Card className={isPro ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle className="text-xl">Pro</CardTitle>
            <CardDescription>Para negocios con alto volumen</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">29.99$</span>
              <span className="text-muted-foreground ml-1">/mes</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Descripciones ilimitadas
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>5 opciones por generación</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Historial ilimitado</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Bullets points para productos</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Análisis SEO básico</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Soporte prioritario
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {plan === "Pro" ? (
              <Button className="w-full" disabled>
                Tu plan actual
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => handleCheckout(proPlanId)}
                disabled={loading}
              >
                {loading ? "Cargando..." : "Actualizar a Pro"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
