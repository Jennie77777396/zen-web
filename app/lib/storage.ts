export interface Sentence {
  id: string;
  text: string;
  categories: string[];
  createdAt: number;
}

export interface AppSettings {
  darkMode: boolean;
  fontSize: number;
  fontFamily: string;
}

const STORAGE_KEYS = {
  SENTENCES: 'cc-booklist-sentences',
  SETTINGS: 'cc-booklist-settings',
} as const;

// Sample data for demonstration
const sampleSentences: Sentence[] = [
  {
    id: '1',
    text: 'All that we are is the result of what we have thought. The mind is everything. What we think we become.',
    categories: ['Wisdom', 'Mind', 'Thought'],
    createdAt: Date.now() - 86400000,
  },
  {
    id: '2',
    text: 'Peace comes from within. Do not seek it without.',
    categories: ['Peace', 'Wisdom'],
    createdAt: Date.now() - 172800000,
  },
  {
    id: '3',
    text: 'Three things cannot be long hidden: the sun, the moon, and the truth.',
    categories: ['Truth', 'Wisdom'],
    createdAt: Date.now() - 259200000,
  },
  {
    id: '4',
    text: 'The only real failure in life is not to be true to the best one knows.',
    categories: ['Truth', 'Life'],
    createdAt: Date.now() - 345600000,
  },
  {
    id: '5',
    text: 'Health is the greatest gift, contentment the greatest wealth, faithfulness the best relationship.',
    categories: ['Wisdom', 'Life', 'Health'],
    createdAt: Date.now() - 432000000,
  },
  {
    id: '6',
    text: 'In the end, only three things matter: how much you loved, how gently you lived, and how gracefully you let go of things not meant for you.',
    categories: ['Love', 'Life', 'Wisdom'],
    createdAt: Date.now() - 518400000,
  },
];

// Sentences
export function getSentences(): Sentence[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.SENTENCES);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(STORAGE_KEYS.SENTENCES, JSON.stringify(sampleSentences));
  return sampleSentences;
}

export function saveSentences(sentences: Sentence[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SENTENCES, JSON.stringify(sentences));
}

export function addSentence(text: string, categories: string[]): Sentence {
  const sentences = getSentences();
  const newSentence: Sentence = {
    id: Date.now().toString(),
    text,
    categories,
    createdAt: Date.now(),
  };
  const updated = [newSentence, ...sentences];
  saveSentences(updated);
  return newSentence;
}

export function deleteSentence(id: string): void {
  const sentences = getSentences();
  const updated = sentences.filter((s) => s.id !== id);
  saveSentences(updated);
}

export function searchSentences(query: string): Sentence[] {
  const sentences = getSentences();
  if (!query.trim()) {
    return sentences;
  }
  const lowerQuery = query.toLowerCase();
  return sentences.filter(
    (s) =>
      s.text.toLowerCase().includes(lowerQuery) ||
      s.categories.some((cat) => cat.toLowerCase().includes(lowerQuery))
  );
}

// Settings
export function getSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return {
      darkMode: false,
      fontSize: 16,
      fontFamily: 'system',
    };
  }
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    darkMode: false,
    fontSize: 16,
    fontFamily: 'system',
  };
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function updateSettings(updates: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const updated = { ...current, ...updates };
  saveSettings(updated);
  return updated;
}
