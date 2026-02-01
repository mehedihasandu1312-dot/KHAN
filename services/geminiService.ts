import { GoogleGenAI, Type } from "@google/genai";
import { DictionaryEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEntryData = async (word: string): Promise<Omit<DictionaryEntry, 'id'>> => {
  const model = "gemini-3-flash-preview";

  const response = await ai.models.generateContent({
    model,
    contents: `You are a specialized bilingual dictionary content generator (Bengali <-> English). 
    Create a highly detailed dictionary entry for the word: "${word}".
    
    INSTRUCTIONS:
    1. Detect if the input word is Bengali or English.
    
    IF BENGALI:
    - 'translation': Provide the English equivalent.
    - 'pronunciationBn': The Bengali pronunciation script/spelling if complex, or just the word.
    - 'meaning': Definition in Bengali.
    - 'partOfSpeech': Grammatical part of speech in Bengali (e.g., বিশেষ্য).
    - 'sandhi', 'samas': Fill if applicable.
    
    IF ENGLISH:
    - 'translation': Provide the Bengali equivalent (Meaning in short).
    - 'pronunciationBn': Write the English pronunciation in Bengali script (e.g., Apple -> অ্যাপল).
    - 'meaning': Detailed definition in Bengali.
    - 'partOfSpeech': Part of speech in Bengali (e.g., Noun -> বিশেষ্য).
    - 'sandhi', 'samas': Leave empty.
    - 'source': Set to 'বিদেশি' or 'ইংরেজি'.
    
    GENERAL FIELDS:
    - 'phonetic': IPA notation.
    - 'description': Comprehensive description in Bengali.
    - 'etymology': Origin/Root of the word (in Bengali script if possible).
    - 'synonyms': List of synonyms (in same language as input word or mixed).
    - 'antonyms': List of antonyms.
    - 'examples': Usage examples in Bengali sentences (if word is English, show usage in a Bengali sentence or English sentence with Bengali meaning).
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          translation: { type: Type.STRING, description: "Translation in the other language" },
          phonetic: { type: Type.STRING },
          pronunciationBn: { type: Type.STRING, description: "Bengali pronunciation/transliteration" },
          partOfSpeech: { type: Type.STRING },
          meaning: { type: Type.STRING, description: "Primary definition in Bengali" },
          description: { type: Type.STRING },
          etymology: { type: Type.STRING, description: "Origin/History" },
          sandhi: { type: Type.STRING, description: "Sandhi (if Bengali)" },
          samas: { type: Type.STRING, description: "Samas (if Bengali)" },
          source: { type: Type.STRING, description: "Source type" },
          sourceWord: { type: Type.STRING, description: "Root word" },
          synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
          antonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
          examples: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["word", "translation", "partOfSpeech", "meaning", "description", "synonyms", "examples"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  return JSON.parse(text) as Omit<DictionaryEntry, 'id'>;
};