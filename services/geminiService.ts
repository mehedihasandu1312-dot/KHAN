import { GoogleGenAI, Type } from "@google/genai";
import { DictionaryEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Renamed to reflect its new purpose: assisting the Admin
export const generateEntryData = async (word: string): Promise<Omit<DictionaryEntry, 'id'>> => {
  const model = "gemini-3-flash-preview";

  const response = await ai.models.generateContent({
    model,
    contents: `You are a dictionary content generator. 
    Create a detailed dictionary entry for the word: "${word}".
    
    If the input is English, provide Bengali translations.
    If the input is Bengali, provide English translations where appropriate.
    
    Ensure the 'meaning' is concise.
    'description' should be detailed.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: "The word, capitalized." },
          phonetic: { type: Type.STRING, description: "IPA pronunciation" },
          partOfSpeech: { type: Type.STRING, description: "e.g., Noun (বিশেষ্য)" },
          meaning: { type: Type.STRING, description: "Primary meaning" },
          description: { type: Type.STRING, description: "Detailed description" },
          synonyms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of synonyms" },
          antonyms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of antonyms" },
          examples: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Bilingual example sentences" },
          origin: { type: Type.STRING, description: "Etymology" }
        },
        required: ["word", "phonetic", "partOfSpeech", "meaning", "description", "synonyms", "examples"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  return JSON.parse(text) as Omit<DictionaryEntry, 'id'>;
};