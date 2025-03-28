import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Star,
  Gift,
  Sparkles,
  Zap,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import Hero from "@/components/home/hero";
import { Suspense, lazy } from "react";

const Header = lazy(() => import("@/components/home/header"));
const Partners = lazy(() => import("@/components/home/partners"));
const Features = lazy(() => import("@/components/home/features"));

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navegación */}
      <Header />

      <main className="flex-1">
        <Suspense fallback={<div>Loading...</div>}>
          {/* Hero Section */}
          <Hero />

          {/* Partners */}
          <Partners />

          {/* Features */}
          <Features />
        </Suspense>

        {/* How it works */}
        <section
          id="how-it-works"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted/40"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Proceso
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Cómo funciona DescribeAI
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Genera descripciones de producto perfectas en tres simples
                  pasos
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="grid gap-6">
                <div className="flex flex-col justify-center space-y-4 rounded-lg border p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <h3 className="text-xl font-bold">Ingresa los detalles</h3>
                  <p className="text-muted-foreground">
                    Proporciona el nombre del producto, categoría, palabras
                    clave y el tono que deseas para tu descripción.
                  </p>
                </div>
              </div>
              <div className="grid gap-6">
                <div className="flex flex-col justify-center space-y-4 rounded-lg border p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <h3 className="text-xl font-bold">Genera descripciones</h3>
                  <p className="text-muted-foreground">
                    Nuestra IA crea múltiples versiones de descripciones
                    persuasivas y optimizadas para SEO en segundos.
                  </p>
                </div>
              </div>
              <div className="grid gap-6">
                <div className="flex flex-col justify-center space-y-4 rounded-lg border p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <h3 className="text-xl font-bold">Personaliza y exporta</h3>
                  <p className="text-muted-foreground">
                    Edita las descripciones a tu gusto y expórtalas directamente
                    a tu tienda o descárgalas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo */}
        <section id="demo" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Demostración
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Mira DescribeAI en acción
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Observa cómo nuestra IA transforma información básica en
                  descripciones que venden
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-4xl py-12">
              <div className="overflow-hidden rounded-lg border bg-background shadow-xl">
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src="/api/placeholder/1200/675"
                    alt="Video demostración"
                    width="1200"
                    height="675"
                    className="aspect-video h-full w-full object-cover"
                  />
                  <div className="flex items-center justify-center absolute inset-0">
                    <Button
                      size="lg"
                      className="rounded-full w-16 h-16 flex items-center justify-center"
                    >
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
                        className="h-6 w-6 ml-1"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      <span className="sr-only">Play</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section
          id="testimonios"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted/40"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Testimonios
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Lo que dicen nuestros clientes
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Miles de empresas confían en DescribeAI para sus descripciones
                  de producto
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col justify-between rounded-lg border bg-background p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    "Desde que empezamos a usar DescribeAI, nuestras
                    conversiones han aumentado en un 27%. Las descripciones son
                    profesionales y realmente conectan con nuestros clientes."
                  </p>
                </div>
                <div className="mt-6 flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-muted"></div>
                  <div>
                    <p className="text-sm font-medium">María Rodríguez</p>
                    <p className="text-sm text-muted-foreground">
                      Directora de Marketing, ModeStyle
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-lg border bg-background p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    "El tiempo que ahorramos es increíble. Antes tardábamos
                    horas escribiendo descripciones, ahora generamos decenas en
                    minutos y son de mejor calidad."
                  </p>
                </div>
                <div className="mt-6 flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-muted"></div>
                  <div>
                    <p className="text-sm font-medium">Carlos Méndez</p>
                    <p className="text-sm text-muted-foreground">
                      CEO, TechGadgets
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-lg border bg-background p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    "La integración con Shopify es perfecta. Nuestro catálogo de
                    500+ productos fue actualizado con descripciones optimizadas
                    en un fin de semana."
                  </p>
                </div>
                <div className="mt-6 flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-muted"></div>
                  <div>
                    <p className="text-sm font-medium">Laura Torres</p>
                    <p className="text-sm text-muted-foreground">
                      Fundadora, Casa Bella
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
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
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 lg:grid-cols-2">
              <div className="flex flex-col rounded-lg border bg-background shadow-sm">
                <div className="p-6">
                  <h3 className="text-2xl font-bold">Básico</h3>
                  <div className="mt-4 flex items-baseline text-5xl font-bold">
                    9.99€
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
                      <span>Hasta 50 descripciones por mes</span>
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
                    29.99€
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
                      <span>Descripciones ilimitadas</span>
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
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      <span>Integración con Shopify y WooCommerce</span>
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

        {/* FAQ */}
        <section
          id="faq"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted/40"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  FAQ
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Preguntas frecuentes
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Respuestas a las dudas más comunes sobre DescribeAI
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl space-y-4 py-12">
              <div className="rounded-lg border bg-background p-6">
                <h3 className="text-lg font-bold">
                  ¿Cómo funciona la prueba gratuita?
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Ofrecemos 7 días de prueba gratuita con acceso a todas las
                  funcionalidades del plan Pro. No requiere tarjeta de crédito y
                  puedes cancelar en cualquier momento.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6">
                <h3 className="text-lg font-bold">
                  ¿Puedo integrar DescribeAI con mi tienda online?
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Sí, ofrecemos integraciones con las principales plataformas de
                  e-commerce como Shopify, WooCommerce, PrestaShop y Magento.
                  Para otras plataformas, puedes exportar las descripciones en
                  diferentes formatos.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6">
                <h3 className="text-lg font-bold">
                  ¿En qué idiomas genera descripciones DescribeAI?
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Actualmente soportamos español, inglés, francés, alemán,
                  italiano y portugués. Estamos trabajando para añadir más
                  idiomas en el futuro.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6">
                <h3 className="text-lg font-bold">
                  ¿Las descripciones generadas son originales?
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Sí, cada descripción es única y generada específicamente para
                  tu producto. Además, puedes personalizar el tono y estilo para
                  que se adapte perfectamente a tu marca.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6">
                <h3 className="text-lg font-bold">
                  ¿Puedo cambiar de plan más adelante?
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Por supuesto, puedes actualizar o reducir tu plan en cualquier
                  momento. Los cambios se aplicarán en tu próximo ciclo de
                  facturación.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6">
                <h3 className="text-lg font-bold">¿Ofrecen soporte técnico?</h3>
                <p className="mt-2 text-muted-foreground">
                  Todos los planes incluyen soporte técnico por email. Los
                  clientes del plan Pro disfrutan de soporte prioritario con
                  tiempos de respuesta garantizados.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Potencia tus productos hoy mismo
                </h2>
                <p className="mx-auto max-w-[600px] text-primary-foreground/90 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Crea descripciones convincentes en minutos y aumenta tus
                  ventas
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="group">
                    Comenzar Prueba Gratuita
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-primary-foreground"
                  >
                    Ver Demostración
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-background">
        <div className="container px-4 py-12 md:px-6 md:py-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="space-y-4 col-span-2 lg:col-span-2">
              <Link href="/" className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6" />
                <span className="font-bold text-xl">DescribeAI</span>
              </Link>
              <p className="text-muted-foreground max-w-xs">
                Potencia tus productos con descripciones de calidad generadas
                por inteligencia artificial.
              </p>
              <div className="flex space-x-4">
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
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
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                  <span className="sr-only">Facebook</span>
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
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
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
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
                    className="h-5 w-5"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span className="sr-only">Instagram</span>
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
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
                    className="h-5 w-5"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-wide">
                Producto
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#features"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Características
                  </Link>
                </li>
                <li>
                  <Link
                    href="#how-it-works"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cómo Funciona
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Precios
                  </Link>
                </li>
                <li>
                  <Link
                    href="#faq"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-wide">
                Empresa
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Sobre Nosotros
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Prensa
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Trabaja con nosotros
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-wide">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Términos
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cookies
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Licencias
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              © 2025 DescribeAI. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Términos
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacidad
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
