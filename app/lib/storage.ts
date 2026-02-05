// Type definitions
export interface Sentence {
  id: string;
  text: string;
  categoryIds: string[]; // 多分类支持
  categoryNames: string[]; // 多个分类名称
  createdAt: number;
}

export interface AppSettings {
  darkMode: boolean;
  fontSize: number;
  fontFamily: string;
}

const STORAGE_KEYS = {
  SETTINGS: 'cc-booklist-settings',
} as const;

// Search function - now uses API data instead of localStorage
export function searchSentences(query: string, sentences: Sentence[]): Sentence[] {
  if (!query.trim()) {
    return sentences;
  }
  const lowerQuery = query.toLowerCase();
  return sentences.filter(
    (s) =>
      s.text.toLowerCase().includes(lowerQuery) ||
      s.categoryNames.some(name => name.toLowerCase().includes(lowerQuery))
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
