/**
 * Lecture typée des variables d'environnement Vite.
 * Toutes les variables VITE_* sont accessibles ici.
 */
export const env = {
  apiUrl:      import.meta.env.VITE_API_URL      ?? 'https://api.kwismo.com',
  appName:     import.meta.env.VITE_APP_NAME     ?? 'KWISMO',
  defaultLang: import.meta.env.VITE_DEFAULT_LANG ?? 'fr',
} as const;
