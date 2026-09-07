interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_DEFAULT_LANG: string;
  readonly VITE_USE_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
