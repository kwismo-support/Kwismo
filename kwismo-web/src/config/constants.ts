/**
 * Constantes globales de l'application.
 */

/** Durée de cache TanStack Query (ms) */
export const QUERY_STALE_TIME = 1000 * 60 * 5; // 5 min

/** Clé de stockage du thème */
export const THEME_STORAGE_KEY = 'kwismo-theme';

/** Clé de stockage de la langue */
export const LANG_STORAGE_KEY = 'kwismo-lang';

/** Langues supportées */
export const SUPPORTED_LANGS = ['fr', 'en'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

/** Langue par défaut */
export const DEFAULT_LANG: SupportedLang = 'fr';

/** Pagination par défaut */
export const DEFAULT_PAGE_SIZE = 20;

/** Rôles utilisateur */
export const ROLES = {
  ADMIN:   'admin',
  PARTNER: 'partner',
  USER:    'user',
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Clé localStorage du token (référence, le token réel est en cookie httpOnly) */
export const AUTH_USER_KEY = 'kwismo-user';
