import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface AIWorkoutParams {
  goal: string;
  level: string;
  days: number;
  equipment: string;
  duration: string;
}

export async function generateWorkoutRoutine(params: AIWorkoutParams) {
  if (!ai) {
    throw new Error("Gemini API Key not configured");
  }

  const prompt = `
    Crie uma rotina de treino completa e detalhada para uma pessoa com o seguinte perfil:
    - Objetivo: ${params.goal}
    - Nível: ${params.level}
    - Frequência: ${params.days} dias por semana
    - Equipamento disponível: ${params.equipment}
    - Duração média por treino: ${params.duration}

    Retorne APENAS um JSON válido (sem markdown, sem explicações extras) seguindo estritamente esta estrutura para cada dia de treino:
    [
      {
        "name": "Nome do Treino (ex: Treino A - Peito e Tríceps)",
        "day": "Dia da semana sugerido (ex: Segunda, Terça... use apenas: Segunda, Terça, Quarta, Quinta, Sexta, Sábado, Domingo)",
        "time": "Horário sugerido (ex: 18:00)",
        "exercises": [
          {
            "name": "Nome do exercício",
            "sets": "Número de séries (ex: 3)",
            "reps": "Número de repetições (ex: 10-12)",
            "weight": "Carga sugerida ou 0 se for peso do corpo (ex: 0)"
          }
        ]
      }
    ]
    
    Certifique-se de distribuir os dias de forma lógica para descanso muscular.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              day: { type: Type.STRING },
              time: { type: Type.STRING },
              exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    sets: { type: Type.STRING },
                    reps: { type: Type.STRING },
                    weight: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error("No response from AI");
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error generating workout:", error);
    throw error;
  }
}
