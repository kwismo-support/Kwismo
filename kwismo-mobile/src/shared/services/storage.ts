import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const inMemoryStore: Record<string, string> = {};

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch {
      return inMemoryStore[key] || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      inMemoryStore[key] = value;
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch {
      inMemoryStore[key] = value;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      delete inMemoryStore[key];
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch {
      delete inMemoryStore[key];
    }
  },
};
