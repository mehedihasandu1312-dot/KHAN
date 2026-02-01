export interface DictionaryEntry {
  id: string;
  word: string; // The main word (e.g., "Apple")
  translation: string; // The direct equivalent / পরিভাষা
  phonetic: string; // IPA
  pronunciationBn: string; // উচ্চারণ
  partOfSpeech: string; // পদ (e.g., বিশেষ্য)
  
  // Core Meanings
  meaning: string; // অর্থ
  description: string; // বিস্তারিত বিবরণ
  
  // Linguistics (New Fields)
  etymology?: string; // ব্যুৎপত্তি
  sandhi?: string; // সন্ধি
  samas?: string; // সমাস
  source?: string; // উৎস (e.g., তৎসম, তদ্ভব)
  sourceWord?: string; // উৎস শব্দ
  
  synonyms: string[];
  antonyms: string[];
  examples: string[];
  origin?: string;
}

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

export interface HistoryItem {
  word: string;
  timestamp: number;
}