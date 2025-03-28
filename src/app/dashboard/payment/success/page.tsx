"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const planFromUrl = searchParams.get("plan");
    setPlan(planFromUrl);

    // Lanzar confetti para celebrar
    launchConfetti();

    // Registrar evento de conversión
    try {
      console.log("Registro de conversión:", planFromUrl);
    } catch (error) {
      console.error("Error al registrar conversión:", error);
    }

    // Notificar al usuario con un toast
    toast.success("¡Pago completado con éxito!", {
      description: `Tu suscripción ${planFromUrl || ""} ha sido activada.`,
    });
  }, []);

  const launchConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  return (
    <div className="container max-w-lg mx-auto py-10">
      <Card className="border-2 border-green-500">
        <CardHeader className="pb-2 text-center">
          <div className="mx-auto mb-4 bg-green-100 p-3 rounded-full">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            ¡Pago Completado!
          </CardTitle>
          <CardDescription>
            Tu suscripción a DescribeAI{" "}
            {plan && <span className="font-medium">Plan {plan}</span>} ha sido
            activada correctamente.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 pb-2 space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">
              ¿Qué incluye tu nueva suscripción?
            </h3>
            <ul className="space-y-2">
              {plan === "Pro" ? (
                <>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Generación ilimitada de descripciones</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>
                      Análisis SEO avanzado para todas tus descripciones
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Exportación en todos los formatos disponibles</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Integración con plataformas e-commerce</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Soporte prioritario 24/7</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>100 descripciones al mes</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Análisis SEO básico</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Exportación en formato TXT y HTML</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Soporte por email</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2">
          <Button className="w-full" asChild>
            <Link href="/dashboard">
              Ir al dashboard ahora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button className="w-full" variant="outline" asChild>
            <Link href="/dashboard/new">
              Crear tu primer producto
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          ¿Tienes alguna pregunta sobre tu suscripción?{" "}
          <Link
            href="/dashboard/help"
            className="font-medium text-primary underline underline-offset-4"
          >
            Contacta con soporte
          </Link>
        </p>
      </div>
    </div>
  );
}
