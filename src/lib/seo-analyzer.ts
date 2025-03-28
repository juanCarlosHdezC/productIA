// src/lib/seo-analyzer.ts
import { deepseekClient } from "./deepseek";
import { prisma } from "./prisma";
import { z } from "zod";

const SeoAnalysisResponseSchema = z.object({
  score: z.number().min(0).max(100),
  keywordDensity: z.number().min(0).max(100),
  readabilityScore: z.number().min(0).max(100),
  suggestions: z.array(z.string()),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export type SeoAnalysisResponse = z.infer<typeof SeoAnalysisResponseSchema>;

export async function analyzeSEO(
  descriptionId: string
): Promise<SeoAnalysisResponse> {
  try {
    // Obtener la descripción y el producto asociado
    const description = await prisma.description.findUnique({
      where: { id: descriptionId },
      include: { product: true, user: true },
    });

    if (!description) {
      throw new Error("Descripción no encontrada");
    }

    const { content } = description;
    const { name, keywords, category } = description.product;

    // Preparar las keywords en formato legible
    const keywordsArray = (keywords as string[]) || [];
    const keywordsText = keywordsArray.join(", ");

    // Prompt para el análisis SEO con DeepSeek
    const prompt = `
      Analiza la siguiente descripción de producto para SEO y devuelve un análisis detallado en formato JSON.
      
      PRODUCTO:
      Nombre: ${name}
      Categoría: ${category || "No especificada"}
      Palabras clave: ${keywordsText}
      
      DESCRIPCIÓN:
      ${content}
      
      Realiza un análisis SEO completo y devuelve exactamente el siguiente formato JSON:
      {
        "score": (puntuación general de 0 a 100),
        "keywordDensity": (densidad de palabras clave en porcentaje, de 0 a 100),
        "readabilityScore": (puntuación de legibilidad de 0 a 100),
        "suggestions": [
          (array de strings con 3-5 sugerencias concretas de mejora)
        ],
        "metaTitle": (sugerencia de meta título optimizado para SEO, máximo 60 caracteres),
        "metaDescription": (sugerencia de meta descripción optimizada para SEO, máximo 160 caracteres)
      }
      
      Devuelve SOLO el JSON sin ningún texto adicional.
    `;

    // Llamar a la API de DeepSeek
    const completion = await deepseekClient.createChatCompletion({
      model: "deepseek-chat", // Ajusta según el modelo específico que utilices
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 1000, // Ajusta según sea necesario
    });

    const responseText = completion.choices[0].message.content || "{}";
    const responseJson = JSON.parse(responseText);

    // Validar y parsear la respuesta
    const validatedResponse = SeoAnalysisResponseSchema.parse(responseJson);

    // Guardar el análisis en la base de datos
    await prisma.seoAnalysis.upsert({
      where: { descriptionId },
      update: {
        score: validatedResponse.score,
        keywordDensity: validatedResponse.keywordDensity,
        readabilityScore: validatedResponse.readabilityScore,
        suggestions: validatedResponse.suggestions,
        metaTitle: validatedResponse.metaTitle,
        metaDescription: validatedResponse.metaDescription,
        updatedAt: new Date(),
      },
      create: {
        descriptionId,
        score: validatedResponse.score,
        keywordDensity: validatedResponse.keywordDensity,
        readabilityScore: validatedResponse.readabilityScore,
        suggestions: validatedResponse.suggestions,
        metaTitle: validatedResponse.metaTitle,
        metaDescription: validatedResponse.metaDescription,
      },
    });

    return validatedResponse;
  } catch (error) {
    console.error("Error en el análisis SEO:", error);
    throw new Error("No se pudo realizar el análisis SEO");
  }
}
