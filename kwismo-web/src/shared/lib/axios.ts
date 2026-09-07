import axios from 'axios';
import { env } from '@/config/env';


export const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.detail ?? error.message ?? 'Une erreur est survenue';

    if (status === 401) {
      window.location.href = '/auth/login';
    }

    return Promise.reject(new Error(message));
  },
);


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
