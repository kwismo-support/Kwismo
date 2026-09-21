import { env } from '../config/env';

export const formatAvatarUrl = (url?: string | null): string | undefined => {
  if (!url || !url.trim()) return undefined;
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('file://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  const baseOrigin = env.API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  return `${baseOrigin}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};
