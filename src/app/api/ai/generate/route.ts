// 12. API para generar descripciones
// src/app/api/ai/generate/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { deepseekClient } from "@/lib/deepseek";
import { prisma } from "@/lib/prisma";
import { checkSubscription } from "@/utils/subscription";
import { differenceInCalendarDays, startOfDay } from "date-fns";

async function checkDailyLimit(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new Error("Usuario no encontrado");

  const today = startOfDay(new Date());
  const lastReset = user.dailyResetDate
    ? startOfDay(user.dailyResetDate)
    : null;
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const dailyAllowance = (user.descriptionQuota || 0) / daysInMonth;

  // Reiniciar si es un nuevo día
  if (!lastReset || differenceInCalendarDays(today, lastReset) > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        descriptionsToday: 0,
        dailyResetDate: today,
      },
    });
    user.descriptionsToday = 0;
  }

  if (user.descriptionsToday >= dailyAllowance) {
    throw new Error("Has alcanzado tu límite diario de descripciones.");
  }

  // Incrementar uso del día y global
  await prisma.user.update({
    where: { id: userId },
    data: {
      descriptionsToday: { increment: 1 },
      descriptionsUsed: { increment: 1 },
    },
  });

  return {
    remainingToday: Math.floor(dailyAllowance - user.descriptionsToday - 1), // ya se va a usar 1
    remainingMonth: user.descriptionQuota - user.descriptionsUsed - 1,
  };
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { name, category, keywords, tone, productId } = await req.json();

    if (
      !name ||
      !category ||
      !Array.isArray(keywords) ||
      keywords.length === 0 ||
      !tone
    ) {
      return NextResponse.json(
        { message: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Verificar suscripción
    const isPro = await checkSubscription(session.user.id);
    // if (!isPro) {
    //   return new NextResponse(
    //     "Debes tener una suscripción activa para generar descripciones.",
    //     { status: 403 }
    //   );
    // }
    // Obtener el plan del usuario
    const userPlan = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        plan: true,
      },
    });

    const userData = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userData) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    await checkDailyLimit(session.user.id); // 🔥 Aquí validamos el límite diario

    const maxDescriptions =
      userPlan?.plan === "Pro" ? 5 : userPlan?.plan === "Básico" ? 2 : 1;

    // Construcción del prompt
    const prompt = `
      Genera ${maxDescriptions} descripciones de producto diferentes para un producto con las siguientes características:
      
      Nombre: ${name}
      Categoría: ${category}
      Palabras clave: ${keywords.join(", ")}
      Tono: ${tone}
      
      Cada descripción debe ser única, persuasiva y optimizada para SEO.
      Utiliza un lenguaje claro y atractivo que conecte con el público objetivo.
      
      ${
        isPro
          ? "Incluye títulos atractivos y bullets points destacando las características principales."
          : ""
      }
      
      Formato de respuesta:
      [
        {
          "title": "Título sugerido",
          "description": "Descripción completa",
          "bullets": ["Punto 1", "Punto 2", "Punto 3"]
        },
        ...
      ]
    `;

    // Generar descripción con Deepseek
    console.log("Prompt enviado a Deepseek:", prompt);
    const response = await deepseekClient.createChatCompletion({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "Eres un experto copywriter especializado en descripciones de productos para e-commerce.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      // userPlan?.plan === "Pro"
      //   ? 600000
      //   : userPlan?.plan === "Básico"
      //   ? 150000
      //   : 30000,
    });

    // Manejo de errores al parsear la respuesta
    interface GeneratedDescription {
      title: string;
      description: string;
      bullets: string[];
    }

    let generatedDescriptions: GeneratedDescription[] = [];
    try {
      const content = response.choices[0].message?.content;

      if (content) {
        console.log("Contenido generado por el modelo:", content);
        const cleanedContent = content.replace(/```json|```/g, "").trim();
        generatedDescriptions = JSON.parse(cleanedContent);
      } else {
        throw new Error("Contenido vacío en la respuesta del modelo.");
      }
    } catch (error) {
      console.error("Error al parsear la respuesta:", error);
      generatedDescriptions = [
        {
          title: "Descripción generada",
          description:
            response.choices[0].message?.content ||
            "No se pudo generar una descripción.",
          bullets: [],
        },
      ];
    }

    // Guardar en la base de datos si hay un productId
    if (productId) {
      // Verificar si el producto existe y pertenece al usuario
      const existingProduct = await prisma.product.findUnique({
        where: {
          id: productId,
          userId: session.user.id,
        },
      });

      if (!existingProduct) {
        // Crear nuevo producto
        const newProduct = await prisma.product.create({
          data: {
            name,
            category,
            keywords: keywords, // Ahora esto se guarda como JSON directamente
            tone,
            userId: session.user.id,
          },
        });

        // Guardar la primera descripción
        await prisma.description.create({
          data: {
            content: JSON.stringify(generatedDescriptions[0]),
            productId: newProduct.id,
            userId: session.user.id,
          },
        });
      } else {
        // Guardar la primera descripción para el producto existente
        await prisma.description.create({
          data: {
            content: JSON.stringify(generatedDescriptions[0]),
            productId: existingProduct.id,
            userId: session.user.id,
          },
        });
      }
    }

    return NextResponse.json({ descriptions: generatedDescriptions });
  } catch (error) {
    console.error("Error al generar descripción:", error);
    return NextResponse.json(
      { message: "Error al generar descripción:", error },
      { status: 500 }
    );
  }
}
