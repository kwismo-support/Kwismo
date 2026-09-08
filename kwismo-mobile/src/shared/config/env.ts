// Configuration globale des variables d'environnement avec détection automatique de l'IP Hôte
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiBaseUrl = (): string => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:7001/api/v1';

  if (Platform.OS === 'web') {
    return configuredUrl;
  }

  // Sur mobile physique (Android / iOS via Expo Go), remplacer localhost par l'IP LAN du PC hôte
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp) {
      return `http://${hostIp}:7001/api/v1`;
    }
  }

  // Fallback IP LAN Wi-Fi direct si pas détecté dans l'hôte Expo
  return configuredUrl.replace('localhost', '172.17.4.55').replace('127.0.0.1', '172.17.4.55');
};

export const env = {
  USE_MOCK_DATA: process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true',
  API_BASE_URL: getApiBaseUrl(),
  AUTH_TOKEN_KEY: 'kwismo_jwt_access_token',
};
