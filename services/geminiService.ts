import { GoogleGenAI, Type } from "@google/genai";
import { DictionaryEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEntryData = async (word: string, language: 'bn' | 'en'): Promise<Omit<DictionaryEntry, 'id' | 'language'>> => {
  const model = "gemini-3-flash-preview";

  const prompt = `You are a specialized bilingual dictionary content generator.
  The user wants to add a **${language === 'bn' ? 'BENGALI' : 'ENGLISH'}** word to the dictionary.
  Word: "${word}"

  INSTRUCTIONS:
  ${language === 'bn' ? `
  Target: BENGALI WORD.
  - 'translation': Provide the English equivalent.
  - 'pronunciationBn': The Bengali pronunciation.
  - 'meaning': Definition in Bengali.
  - 'partOfSpeech': Grammatical part of speech in Bengali (e.g., বিশেষ্য).
  - 'sandhi', 'samas': Fill if applicable.
  ` : `
  Target: ENGLISH WORD.
  - 'translation': Provide the Bengali equivalent (Short Meaning).
  - 'pronunciationBn': Write the English pronunciation in Bengali script (e.g., Apple -> অ্যাপল).
  - 'meaning': Detailed definition in Bengali.
  - 'partOfSpeech': Part of speech in Bengali (e.g., Noun -> বিশেষ্য).
  - 'sandhi', 'samas': Leave empty strings.
  - 'source': Set to 'বিদেশি' or 'ইংরেজি'.
  `}

  GENERAL FIELDS:
  - 'phonetic': IPA notation.
  - 'description': Comprehensive description in Bengali.
  - 'etymology': Origin/Root of the word (in Bengali script if possible).
  - 'synonyms': List of synonyms.
  - 'antonyms': List of antonyms.
  - 'examples': Usage examples in Bengali sentences (if word is English, provide English sentence with Bengali translation in brackets).
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
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

  return JSON.parse(text) as Omit<DictionaryEntry, 'id' | 'language'>;
};