export const env = {
  apiUrl:      import.meta.env.VITE_API_URL      ?? 'http://localhost:7001/api/v1',
  appName:     import.meta.env.VITE_APP_NAME     ?? 'KWISMO',
  defaultLang: import.meta.env.VITE_DEFAULT_LANG ?? 'fr',
  useMock:     import.meta.env.VITE_USE_MOCK === 'true',
} as const;
