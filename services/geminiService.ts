import { GoogleGenAI, Type } from "@google/genai";
import { DictionaryEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const lookupWord = async (word: string): Promise<DictionaryEntry> => {
  const model = "gemini-3-flash-preview";

  const response = await ai.models.generateContent({
    model,
    contents: `You are a comprehensive bilingual dictionary (English <-> Bengali). 
    Provide a detailed dictionary entry for the word: "${word}".
    
    If the input is English, provide the Bengali meaning.
    If the input is Bengali, provide the Bengali definition/elaboration.
    
    Ensure the 'meaning' is concise (one sentence), while 'description' provides more context or nuance.
    'phonetic' should be the IPA pronunciation.
    'examples' should include at least 2 sentences (with Bengali translations in parentheses).
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: "The word being defined, properly capitalized or in script." },
          phonetic: { type: Type.STRING, description: "IPA pronunciation guide" },
          partOfSpeech: { type: Type.STRING, description: "Noun, Verb, Adjective, etc. (in Bengali script if possible, e.g., বিশেষ্য)" },
          meaning: { type: Type.STRING, description: "Primary meaning in Bengali" },
          description: { type: Type.STRING, description: "A slightly longer explanation or definition in Bengali" },
          synonyms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of synonyms (Bengali or English depending on context)" },
          antonyms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of antonyms" },
          examples: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Usage examples in sentences" },
          origin: { type: Type.STRING, description: "Etymology or origin of the word (optional)" }
        },
        required: ["word", "phonetic", "partOfSpeech", "meaning", "description", "synonyms", "examples"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  return JSON.parse(text) as DictionaryEntry;
};