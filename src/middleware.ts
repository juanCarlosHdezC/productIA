// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Configuración de middleware de Next.js
export const config = {
  // Rutas protegidas (requieren autenticación)
  matcher: [
    /*
     * Excluir archivos estáticos, API de autenticación y la página de error:
     * - /_next (Archivos estáticos de Next.js)
     * - /images (Imágenes estáticas)
     * - /api/auth (API de autenticación de NextAuth)
     * - /login (Página de inicio de sesión)
     * - /register (Página de registro)
     * - /pricing (Página de precios)
     */
    "/((?!_next|images|api/auth|login|register|pricing|favicon.ico).*)",
    "/dashboard/:path*",
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // Para páginas que requieren autenticación (basado en el matcher)
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Si no hay token (no autenticado), redirigir a login
    if (!token) {
      const url = new URL(`/login`, request.url);
      url.searchParams.set("callbackUrl", encodeURIComponent(request.url));
      return NextResponse.redirect(url);
    }
  }

  // Verificar límites específicos para rutas de API con uso intensivo
  if (pathname.startsWith("/api/ai/generate")) {
    try {
      // Verificar cabecera de plan
      const planHeader = request.headers.get("x-user-plan") || "basic";

      // Si no hay cabecera de plan, se asume plan básico
      const isPro = planHeader === "pro";

      // Establecer límite de timeout según plan
      // Reducimos el tiempo de respuesta para planes básicos para evitar abuso
      const timeout = isPro ? 60000 : 30000; // 60s para pro, 30s para básico

      // Añadir cabecera de timeout para que el servidor la use
      requestHeaders.set("x-request-timeout", timeout.toString());

      // Continuar con la solicitud con las cabeceras modificadas
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error("Error en middleware AI:", error);
      // En caso de error, continuar con valores predeterminados
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  // Para el resto de rutas, simplemente continuar con las cabeceras modificadas
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
