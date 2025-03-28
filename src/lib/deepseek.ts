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
    } catch (error) {
      console.error("Error en la API de Deepseek:", error);
      throw error;
    }
  },
};
