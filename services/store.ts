import { DictionaryEntry } from "../types";

const DB_KEY = 'borno_db_v1';

// Seed data to ensure the app isn't empty on first load
const SEED_DATA: DictionaryEntry[] = [
  {
    id: '1',
    word: 'Serendipity',
    phonetic: '/ˌsɛr.ənˈdɪp.ɪ.ti/',
    partOfSpeech: 'noun (বিশেষ্য)',
    meaning: 'The occurrence of events by chance in a happy or beneficial way.',
    description: 'দৈবক্রমে শুভ বা আনন্দদায়ক কিছু খুঁজে পাওয়ার ঘটনা।',
    synonyms: ['Chance', 'Fate', 'Fluke'],
    antonyms: ['Misfortune', 'Bad luck'],
    examples: [
        'Finding this book was pure serendipity. (এই বইটি খুঁজে পাওয়া ছিল নিতান্তই এক সুখকর দৈবঘটনা।)',
        'We met by serendipity in the park. (পার্কে আমাদের দেখা হয়েছিল এক দৈবযোগে।)'
    ],
    origin: 'Coined by Horace Walpole in 1754.'
  },
  {
    id: '2',
    word: 'সূর্যমুখী',
    phonetic: '/sur.jo.mu.kʰi/',
    partOfSpeech: 'noun (বিশেষ্য)',
    meaning: 'A tall North American plant of the daisy family, with very large golden-rayed flowers.',
    description: 'এক প্রকার বৃহৎ হলুদ রঙের ফুল যা সূর্যের দিকে মুখ করে থাকে।',
    synonyms: ['Sunflower'],
    antonyms: [],
    examples: [
        'সূর্যমুখী ফুল দেখতে খুব সুন্দর। (Sunflowers are very beautiful to look at.)',
        'ক্ষেতটি সূর্যমুখীতে ভরে গেছে। (The field is full of sunflowers.)'
    ]
  }
];

export const getWords = (): DictionaryEntry[] => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    // Initialize with seed data
    localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  return JSON.parse(data);
};

export const saveWord = (entry: DictionaryEntry) => {
  const words = getWords();
  const existingIndex = words.findIndex(w => w.id === entry.id);
  
  if (existingIndex >= 0) {
    words[existingIndex] = entry;
  } else {
    words.unshift(entry); // Add new to top
  }
  
  localStorage.setItem(DB_KEY, JSON.stringify(words));
};

export const deleteWord = (id: string) => {
  const words = getWords();
  const newWords = words.filter(w => w.id !== id);
  localStorage.setItem(DB_KEY, JSON.stringify(newWords));
};

export const searchLocalWords = (query: string): DictionaryEntry[] => {
  const words = getWords();
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return words;

  return words.filter(item => 
    item.word.toLowerCase().includes(lowerQuery) || 
    item.meaning.toLowerCase().includes(lowerQuery)
  );
};