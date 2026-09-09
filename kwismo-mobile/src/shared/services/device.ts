import { storage } from './storage';

const DEVICE_FINGERPRINT_KEY = 'kwismo_device_fingerprint_v1';

function generateUUID(): string {
  return 'kwismo-dev-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getDeviceFingerprint(): Promise<string> {
  try {
    const existing = await storage.getItem(DEVICE_FINGERPRINT_KEY);
    if (existing) {
      return existing;
    }
    const newId = generateUUID();
    await storage.setItem(DEVICE_FINGERPRINT_KEY, newId);
    return newId;
  } catch (err) {
    console.warn('Erreur lors de la lecture du device fingerprint:', err);
  }
  return 'kwismo-dev-fallback-' + Date.now();
}
