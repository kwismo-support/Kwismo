// Client de stockage unifié (Web + React Native) pour jetons JWT et session
import { Platform } from 'react-native';

const inMemoryStore: Record<string, string> = {};

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return inMemoryStore[key] || null;
    } catch {
      return inMemoryStore[key] || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      inMemoryStore[key] = value;
    } catch {
      inMemoryStore[key] = value;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      delete inMemoryStore[key];
    } catch {
      delete inMemoryStore[key];
    }
  },
};
