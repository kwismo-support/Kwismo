/**
 * Utilitaire de gestion des jetons JWT et de la validité pour kwismo-web
 */

export interface DecodedJwtPayload {
  sub?: string;
  role?: string;
  type?: string;
  jti?: string;
  exp?: number;
  partner_id?: string;
}

/**
 * Décode la charge utile d'un jeton JWT sans bibliothèque externe.
 */
export function decodeJwt(token: string): DecodedJwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Extrait la date d'expiration (timestamp Unix en secondes) d'un jeton JWT.
 */
export function getJwtExp(token: string): number | null {
  const payload = decodeJwt(token);
  return payload?.exp ?? null;
}

/**
 * Calcule le temps restant en secondes avant l'expiration du jeton.
 */
export function getTokenRemainingSeconds(token: string): number {
  const exp = getJwtExp(token);
  if (!exp) return 0;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return Math.max(0, exp - nowInSeconds);
}

/**
 * Sauvegarde les jetons d'accès et de rafraîchissement avec calcul de l'expiration.
 */
export function setAuthTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem('kwismo_auth_token', accessToken);
  const exp = getJwtExp(accessToken);
  if (exp) {
    localStorage.setItem('kwismo_token_exp', exp.toString());
  }
  if (refreshToken) {
    localStorage.setItem('kwismo_refresh_token', refreshToken);
  }
}

/**
 * Nettoie tous les jetons et données de session.
 */
export function clearAuthTokens(): void {
  localStorage.removeItem('kwismo_auth_token');
  localStorage.removeItem('kwismo_refresh_token');
  localStorage.removeItem('kwismo_token_exp');
  localStorage.removeItem('kwismo_user');
}

/**
 * Récupère ou génère un identifiant stable d'appareil (device_id) pour le backend.
 */
export function getDeviceId(): string {
  let deviceId = localStorage.getItem('kwismo_device_id');
  if (!deviceId) {
    deviceId = 'web-device-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
    localStorage.setItem('kwismo_device_id', deviceId);
  }
  return deviceId;
}
