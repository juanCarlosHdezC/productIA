import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { ArrowRight, Star } from "lucide-react";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Descripciones de Producto Perfectas con IA
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Genera descripciones de producto convincentes, optimizadas para
                SEO y personalizadas a tu marca en segundos. Aumenta tus ventas
                con textos persuasivos.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register">
                <Button size="lg" className="group">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline">
                  Ver Demostración
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-muted-foreground">
                <span className="font-medium">4.9/5</span> basado en +1000
                reseñas de clientes
              </span>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[600px] lg:mx-0">
            <div className="rounded-lg border bg-background p-2 shadow-lg">
              <Image
                src="/dashboard.png"
                alt="Imagen dashboard"
                width={1200}
                height={800}
                className="aspect-video overflow-hidden rounded-md object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
