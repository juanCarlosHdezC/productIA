import { CheckCircle } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";

const Pricing = () => {
  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
              Precios
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Planes para cada necesidad
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Elige el plan que mejor se adapte a tu negocio
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 lg:grid-cols-3">
          <div className="flex flex-col rounded-lg border bg-background shadow-sm">
            <div className="p-6">
              <h3 className="text-2xl font-bold">Gratis</h3>
              <div className="mt-4 flex items-baseline text-5xl font-bold">
                0$
                <span className="ml-1 text-lg font-normal text-muted-foreground">
                  /mes
                </span>
              </div>
              <p className="mt-2 text-muted-foreground">
                Para usuarios Principiantes.
              </p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Hasta 300K tokens por mes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>1 opciones por generación</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Historial de 7 días</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Creación de productos</span>
                </li>
              </ul>
            </div>
            <div className="border-t p-6">
              <Link href="/register">
                <Button className="w-full" variant="outline">
                  Comenzar con Gratis
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex flex-col rounded-lg border bg-background shadow-sm">
            <div className="p-6">
              <h3 className="text-2xl font-bold">Básico</h3>
              <div className="mt-4 flex items-baseline text-5xl font-bold">
                9.99$
                <span className="ml-1 text-lg font-normal text-muted-foreground">
                  /mes
                </span>
              </div>
              <p className="mt-2 text-muted-foreground">
                Perfecto para pequeños negocios y emprendedores.
              </p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Hasta 1,5M de tokens por mes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>2 opciones por generación</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Historial de 30 días</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Soporte por email</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Creación de productos</span>
                </li>
              </ul>
            </div>
            <div className="border-t p-6">
              <Link href="/register">
                <Button className="w-full" variant="outline">
                  Comenzar con Básico
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative flex flex-col rounded-lg border-2 border-primary bg-background shadow-sm">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
              Popular
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold">Pro</h3>
              <div className="mt-4 flex items-baseline text-5xl font-bold">
                29.99$
                <span className="ml-1 text-lg font-normal text-muted-foreground">
                  /mes
                </span>
              </div>
              <p className="mt-2 text-muted-foreground">
                Para negocios con alto volumen de productos.
              </p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Hasta 5M de Tokens por mes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>5 opciones por generación</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Historial ilimitado</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Bullets points para productos</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Análisis SEO básico</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Soporte prioritario</span>
                </li>
              </ul>
            </div>
            <div className="border-t p-6">
              <Link href="/register">
                <Button className="w-full">Comenzar con Pro</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
