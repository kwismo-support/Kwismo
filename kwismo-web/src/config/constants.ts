export const QUERY_STALE_TIME = 1000 * 60 * 5; // 5 min


export const THEME_STORAGE_KEY = 'kwismo-theme';


export const LANG_STORAGE_KEY = 'kwismo-lang';


export const SUPPORTED_LANGS = ['fr', 'en'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];


export const DEFAULT_LANG: SupportedLang = 'fr';


export const DEFAULT_PAGE_SIZE = 20;


export const ROLES = {
  ADMIN:   'admin',
  PARTNER: 'partner',
  USER:    'user',
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];


export const AUTH_USER_KEY = 'kwismo-user';
