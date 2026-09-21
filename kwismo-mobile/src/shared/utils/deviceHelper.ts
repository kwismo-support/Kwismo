import { Platform } from 'react-native';
import Constants from 'expo-constants';

export interface LocalDeviceInfo {
  deviceName: string;
  deviceType: 'mobile' | 'desktop';
  location: string;
  ipOrId: string;
}

export function getRealDeviceName(): string {
  if (Platform.OS === 'android') {
    const model = Constants.deviceName || Constants.expoConfig?.name || 'Android Smartphone';
    return model.includes('kwismo') ? 'Android Mobile' : model;
  }
  if (Platform.OS === 'ios') {
    return Constants.deviceName || 'iPhone';
  }
  return 'Navigateur Web';
}

const DEVICE_MODEL_MAP: Record<string, string> = {
  '23117RA68G': 'Redmi Note 13 Pro',
  '2201117PG': 'POCO X4 Pro 5G',
  '2201116SG': 'Redmi Note 11',
  '2312DRA50G': 'Redmi Note 13',
  'SM-G998B': 'Samsung Galaxy S21 Ultra',
  'SM-S908B': 'Samsung Galaxy S22 Ultra',
  'SM-S918B': 'Samsung Galaxy S23 Ultra',
  'SM-S928B': 'Samsung Galaxy S24 Ultra',
  'SM-A536B': 'Samsung Galaxy A53 5G',
  'SM-A546B': 'Samsung Galaxy A54 5G',
  'iPhone14,2': 'iPhone 13 Pro',
  'iPhone14,3': 'iPhone 13 Pro Max',
  'iPhone14,7': 'iPhone 14',
  'iPhone15,2': 'iPhone 14 Pro',
  'iPhone15,3': 'iPhone 14 Pro Max',
  'iPhone15,4': 'iPhone 15',
  'iPhone16,1': 'iPhone 15 Pro',
  'iPhone16,2': 'iPhone 15 Pro Max',
};

export function formatDeviceName(rawName?: string): string {
  if (!rawName) return getRealDeviceName();
  const trimmed = rawName.trim();
  if (DEVICE_MODEL_MAP[trimmed]) {
    return DEVICE_MODEL_MAP[trimmed];
  }
  for (const [code, friendlyName] of Object.entries(DEVICE_MODEL_MAP)) {
    if (trimmed.includes(code)) return friendlyName;
  }
  if (trimmed.startsWith('23') || trimmed.startsWith('22') || trimmed.startsWith('21')) {
    return `Xiaomi Redmi (${trimmed})`;
  }
  if (trimmed.startsWith('SM-')) {
    return `Samsung Galaxy (${trimmed})`;
  }
  if (trimmed.startsWith('iPhone')) {
    return `Apple iPhone (${trimmed})`;
  }
  if (trimmed === 'Appareil verifie' || trimmed.includes('kwismo-device')) {
    return getRealDeviceName();
  }
  return trimmed;
}

export function getDevicePhysicalLocation(): string {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (timeZone.includes('Douala') || timeZone.includes('Lagos') || timeZone.includes('Africa')) {
      return 'Cameroun, Douala (Akwa)';
    }
    if (timeZone.includes('Paris') || timeZone.includes('Europe')) {
      return 'France, Paris';
    }
  } catch {}
  return 'Cameroun, Douala (Localisation GPS Appareil)';
}

