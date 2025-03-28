import { CheckCircle, Clock, Gift, Zap } from "lucide-react";
import React from "react";

const Features = () => {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
              Características
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Todo lo que necesitas para vender más
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              DescribeAI combina inteligencia artificial avanzada con años de
              experiencia en copywriting para crear descripciones que
              convierten.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full border bg-background p-3">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">IA Avanzada</h3>
            <p className="text-center text-muted-foreground">
              Utiliza modelos de lenguaje de última generación para crear
              descripciones persuasivas.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full border bg-background p-3">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Optimizado para SEO</h3>
            <p className="text-center text-muted-foreground">
              Mejora tu posicionamiento en buscadores con palabras clave
              estratégicas y contenido optimizado.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full border bg-background p-3">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Ahorra Tiempo</h3>
            <p className="text-center text-muted-foreground">
              Genera descripciones completas en segundos, no en horas o días.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full border bg-background p-3">
              <Gift className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Personalizable</h3>
            <p className="text-center text-muted-foreground">
              Adapta el tono, estilo y formato a tu marca y público objetivo.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full border bg-background p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold">Edición Simple</h3>
            <p className="text-center text-muted-foreground">
              Edita y personaliza cualquier texto generado con nuestro editor
              intuitivo.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full border bg-background p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
                <path d="M19 10a7 7 0 0 0-14 0" />
                <path d="M12 3v4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold">Integración E-commerce</h3>
            <p className="text-center text-muted-foreground">
              Conexión directa con Shopify, WooCommerce y otras plataformas
              populares.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
