export interface DictionaryEntry {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaning: string;
  description: string;
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
