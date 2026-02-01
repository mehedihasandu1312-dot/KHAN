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
  - 'inflections': If Verb, give V1, V2, V3 forms (e.g., Go - Went - Gone). If Noun, give Plural. If Adjective, give degrees.
  - 'relatedPhrases': List 2-3 common idioms or phrasal verbs using this word (e.g. for 'Give': 'Give up', 'Give in').
  - 'source': Set to 'বিদেশি' or 'ইংরেজি'.
  - 'sandhi', 'samas': Leave empty strings.
  `}

  GENERAL FIELDS:
  - 'phonetic': IPA notation.
  - 'description': Comprehensive description in Bengali.
  - 'etymology': Origin/Root of the word (in Bengali script if possible).
  - 'synonyms': List of synonyms.
  - 'antonyms': List of antonyms.
  - 'examples': Usage examples. If the word is English, provide the English sentence followed by Bengali translation in parentheses/brackets.
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
          
          inflections: { type: Type.STRING, description: "Word forms (Past tense, Plural etc) for English" },
          relatedPhrases: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Idioms or Phrasal Verbs" },

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