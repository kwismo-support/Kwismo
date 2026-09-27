import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PRODUCTION_API = 'https://api.kwismo.com/api/v1';
const FALLBACK_LOCAL_IP = '172.17.4.55';

const isLocalUrl = (url: string) =>
  url.includes('localhost') || url.includes('127.0.0.1') || url.includes(FALLBACK_LOCAL_IP);

const getApiBaseUrl = (): string => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL || '';

  if (__DEV__) {
    if (configuredUrl && isLocalUrl(configuredUrl)) {
      return configuredUrl
        .replace('localhost', FALLBACK_LOCAL_IP)
        .replace('127.0.0.1', FALLBACK_LOCAL_IP);
    }

    if (Platform.OS !== 'web') {
      const hostUri =
        Constants.expoConfig?.hostUri ||
        (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

      if (hostUri) {
        const hostIp = hostUri.split(':')[0];
        if (hostIp && hostIp !== 'localhost') {
          return `http://${hostIp}:8000/api/v1`;
        }
      }
    }

    return 'http://localhost:8000/api/v1';
  }

  if (configuredUrl && !isLocalUrl(configuredUrl)) {
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
