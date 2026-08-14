import axios from 'axios';
import { env } from '@/config/env';

/**
 * Instance Axios partagée.
 * - Base URL : VITE_API_URL
 * - Credentials (cookies httpOnly) inclus automatiquement
 * - Intercepteur requête  : injecte Content-Type JSON
 * - Intercepteur réponse  : normalise les erreurs API
 */
export const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

/* ── Intercepteur réponse ──────────────────────────────────── */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.detail ?? error.message ?? 'Une erreur est survenue';

    if (status === 401) {
      // Session expirée → rediriger vers login
      window.location.href = '/auth/login';
    }

    return Promise.reject(new Error(message));
  },
);

/**
 * Helpers génériques pour les appels API.
 * Chaque feature service les utilise directement.
 */
export const api = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    apiClient.get<T>(url, { params }).then((r) => r.data),

  post: <T>(url: string, data?: unknown) =>
    apiClient.post<T>(url, data).then((r) => r.data),

  patch: <T>(url: string, data?: unknown) =>
    apiClient.patch<T>(url, data).then((r) => r.data),

  put: <T>(url: string, data?: unknown) =>
    apiClient.put<T>(url, data).then((r) => r.data),

  delete: <T>(url: string) =>
    apiClient.delete<T>(url).then((r) => r.data),
};
