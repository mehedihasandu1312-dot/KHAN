import { DictionaryEntry } from "../types";

const DB_KEY = 'borno_db_v3'; 
const HISTORY_KEY = 'borno_history_v1';

// Seed data to ensure the app isn't empty on first load
const SEED_DATA: DictionaryEntry[] = [
  {
    id: '1',
    word: 'অজ্ঞান',
    translation: 'Unconscious / Ignorant',
    phonetic: '/ɔɡ.ɡæn/',
    pronunciationBn: 'অগ্‌গাঁ',
    partOfSpeech: 'বিশেষণ (Adjective)',
    meaning: 'চেতনা বা বোধশক্তিহীন; জ্ঞানশূন্য।',
    description: 'যার জ্ঞান নেই বা যে সাময়িকভাবে চেতনা হারিয়েছে।',
    etymology: 'ন (অ) + জ্ঞান',
    samas: 'নঞ্‌ তৎপুরুষ সমাস',
    sandhi: '',
    source: 'তৎসম',
    sourceWord: 'অজ্ঞান',
    synonyms: ['বেহুঁশ', 'মূর্ছা', 'মূর্খ'],
    antonyms: ['সজ্ঞান', 'জ্ঞানী'],
    examples: [
        'সে ভয়ে অজ্ঞান হয়ে পড়ল।',
        'অজ্ঞান অচেতনে কত দিন কেটে গেল।'
    ]
  },
  {
    id: '2',
    word: 'বিদ্যালয়',
    translation: 'School',
    phonetic: '/bid.da.lɔe/',
    pronunciationBn: 'বিদ্-দা-লয়',
    partOfSpeech: 'বিশেষ্য (Noun)',
    meaning: 'যেখানে বিদ্যা শিক্ষা দেওয়া হয়।',
    description: 'ছাত্রছাত্রীদের পাঠদানের জন্য নির্দিষ্ট স্থান বা প্রতিষ্ঠান।',
    etymology: 'বিদ্যা + আলয়',
    sandhi: 'বিদ্যা + আলয় = বিদ্যালয়',
    samas: 'চতুর্থী তৎপুরুষ (বিদ্যার নিমিত্ত আলয়)',
    source: 'তৎসম',
    sourceWord: 'বিদ্যালয়',
    synonyms: ['ইশকুল', 'পাঠশালা'],
    antonyms: [],
    examples: [
        'আমি রোজ বিদ্যালয়ে যাই।'
    ]
  }
];

export const getWords = (): DictionaryEntry[] => {
  const data = localStorage.getItem(DB_KEY);
  let words: DictionaryEntry[] = [];
  
  if (!data) {
    // Initialize with seed data
    localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
    words = [...SEED_DATA];
  } else {
    words = JSON.parse(data);
  }
  
  // Sort alphabetically (Dictionary Sequence)
  // Using 'bn' locale ensures correct sorting for both Bengali and English script
  return words.sort((a, b) => a.word.localeCompare(b.word, 'bn', { sensitivity: 'base' }));
};

export const saveWord = (entry: DictionaryEntry) => {
  const words = getWords(); // Returns sorted list
  const existingIndex = words.findIndex(w => w.id === entry.id);
  
  if (existingIndex >= 0) {
    words[existingIndex] = entry;
  } else {
    words.push(entry); 
  }
  
  localStorage.setItem(DB_KEY, JSON.stringify(words));
};

export const deleteWord = (id: string) => {
  const words = getWords();
  const newWords = words.filter(w => w.id !== id);
  localStorage.setItem(DB_KEY, JSON.stringify(newWords));
};

export const searchLocalWords = (query: string): DictionaryEntry[] => {
  const words = getWords(); // This is already sorted
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return words;

  return words.filter(item => 
    item.word.toLowerCase().includes(lowerQuery) || 
    item.translation.toLowerCase().includes(lowerQuery) ||
    item.meaning.toLowerCase().includes(lowerQuery) ||
    (item.source && item.source.toLowerCase().includes(lowerQuery))
  );
};

// --- History Management ---

export const getHistory = (): DictionaryEntry[] => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const addToHistory = (entry: DictionaryEntry) => {
  try {
    let history = getHistory();
    // Remove if already exists to move it to top
    history = history.filter(h => h.id !== entry.id);
    history.unshift(entry); // Recent items stay at top
    // Limit to 10 items
    if (history.length > 10) history.pop();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save history");
  }
};

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};