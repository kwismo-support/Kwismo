const rawApiUrl = import.meta.env.VITE_API_URL;

// If VITE_API_URL is missing, empty, or points to the decommissioned Railway backend,
// automatically fallback to the active production backend on AWS.
const isDeprecatedBackend =
  !rawApiUrl ||
  (typeof rawApiUrl === 'string' && rawApiUrl.includes('railway.app'));

export const env = {
  apiUrl: isDeprecatedBackend ? 'https://api.kwismo.com/api/v1' : rawApiUrl,
  appName: import.meta.env.VITE_APP_NAME ?? 'KWISMO',
  defaultLang: import.meta.env.VITE_DEFAULT_LANG ?? 'fr',
  useMock: import.meta.env.VITE_USE_MOCK === 'true',
} as const;
