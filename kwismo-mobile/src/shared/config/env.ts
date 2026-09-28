import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PRODUCTION_API = 'https://api.kwismo.com/api/v1';

const getApiBaseUrl = (): string => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL || '';

  if (__DEV__) {
    // On native devices/Expo Go, dynamically retrieve the host IP (e.g. 192.168.x.x)
    if (Platform.OS !== 'web') {
      const hostUri =
        Constants.expoConfig?.hostUri ||
        (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

      if (hostUri) {
        const hostIp = hostUri.split(':')[0];
        if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
          return `http://${hostIp}:8000/api/v1`;
        }
      }
    }

    // If configured with an explicit custom IP or domain other than localhost
    if (
      configuredUrl &&
      !configuredUrl.includes('localhost') &&
      !configuredUrl.includes('127.0.0.1')
    ) {
      return configuredUrl;
    }

    // Default fallback for web browser or local simulator
    return 'http://localhost:8000/api/v1';
  }

  if (configuredUrl) {
    return configuredUrl;
  }

  return PRODUCTION_API;
};

export const env = {
  USE_MOCK_DATA: process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true',
  APP_ENV: process.env.EXPO_PUBLIC_APP_ENV || 'development',
  IS_DEV: __DEV__,
  API_BASE_URL: getApiBaseUrl(),
  AUTH_TOKEN_KEY: 'kwismo_jwt_access_token',
  useMock: process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true',
};

