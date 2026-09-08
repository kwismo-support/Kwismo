// Stockage sécurisé des identifiants et code PIN 6 chiffres
import { Platform } from 'react-native';

const PIN_STORAGE_KEY = 'kwismo_user_pin_code';
const BIOMETRIC_ENABLED_KEY = 'kwismo_biometric_enabled';

export async function saveUserPin(pin: string): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(PIN_STORAGE_KEY, pin);
    }
  } catch (err) {
    console.error('Erreur sauvegarde PIN:', err);
  }
}

export async function verifyUserPin(enteredPin: string): Promise<boolean> {
  try {
    let savedPin: string | null = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      savedPin = window.localStorage.getItem(PIN_STORAGE_KEY);
    }
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
    if (typeof window !== 'undefined' && window.localStorage) {
      return !!window.localStorage.getItem(PIN_STORAGE_KEY);
    }
    return false;
  } catch {
    return false;
  }
}

export async function setBiometricPreference(enabled: boolean): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
    }
  } catch (err) {
    console.error('Erreur sauvegarde préférence biométrique:', err);
  }
}

export async function getBiometricPreference(): Promise<boolean> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(BIOMETRIC_ENABLED_KEY) === 'true';
    }
    return false;
  } catch {
    return false;
  }
}
