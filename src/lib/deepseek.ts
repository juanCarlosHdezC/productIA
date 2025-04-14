// 11. Configuración de Deepseek
// src/lib/deepseek.ts

import axios from "axios";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

export const deepseekClient = {
  createChatCompletion: async ({
    model,
    messages,
    temperature,
    max_tokens,
  }: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature: number;
    max_tokens: number;
  }) => {
    // Validar que la clave de API esté configurada
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("La clave de API de Deepseek no está configurada.");
    }
    // Log del payload enviado (solo en desarrollo)
    if (process.env.NODE_ENV === "development") {
      console.log("Payload enviado a Deepseek:", {
        model,
        messages,
        temperature,
        max_tokens,
      });
    }

    try {
      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model,
          messages,
          temperature,
          max_tokens,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error("Error en la API de Deepseek:", {
          status: error.response.status,
          data: error.response.data,
        });
        throw new Error(
          error.response.data?.error || "Error en la solicitud a Deepseek"
        );
      } else {
        console.error("Error en la API de Deepseek:", error.message);
        throw new Error("Error en la solicitud a Deepseek");
      }
    }
  },
};
