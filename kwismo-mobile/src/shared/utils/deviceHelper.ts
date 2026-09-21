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
