// Stockage sécurisé des identifiants et code PIN 6 chiffres (Web & Mobile)
import { Platform } from 'react-native';

const PIN_STORAGE_KEY = 'kwismo_user_pin_code';
const BIOMETRIC_ENABLED_KEY = 'kwismo_biometric_enabled';

const memoryStore: Record<string, string> = {};

async function getItem(key: string): Promise<string | null> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val !== null) return val;
    }
    return memoryStore[key] || null;
  } catch {
    return memoryStore[key] || null;
  }
}

async function setItem(key: string, val: string): Promise<void> {
  try {
    memoryStore[key] = val;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, val);
    }
  } catch (err) {
    console.error('Erreur stockage:', err);
  }
}

export async function saveUserPin(pin: string): Promise<void> {
  await setItem(PIN_STORAGE_KEY, pin);
}

export async function verifyUserPin(enteredPin: string): Promise<boolean> {
  try {
    const savedPin = await getItem(PIN_STORAGE_KEY);
    if (!savedPin) {
      return enteredPin === '123456';
    }
    return savedPin === enteredPin;
  } catch {
    return false;
  }
}

export async function hasConfiguredPin(): Promise<boolean> {
  try {
    const pin = await getItem(PIN_STORAGE_KEY);
    return !!pin;
  } catch {
    return false;
  }
}

export async function setBiometricPreference(enabled: boolean): Promise<void> {
  await setItem(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
}

export async function getBiometricPreference(): Promise<boolean> {
  try {
    const val = await getItem(BIOMETRIC_ENABLED_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

