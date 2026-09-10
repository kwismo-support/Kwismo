import axios from 'axios';
import { env } from '@/config/env';


import { useAuthStore } from '@/shared/store/authStore';

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.detail ?? error.message ?? 'Une erreur est survenue';

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const authStore = useAuthStore.getState();
      const refreshToken = authStore.refreshToken;
      
      if (refreshToken) {
        try {
          // Attempt to refresh
          const res = await axios.post(`${env.apiUrl}/auth/refresh`, {
            refresh_token: refreshToken
          });
          const newToken = res.data.access_token;
          const newRefresh = res.data.refresh_token;
          
          authStore.setTokens(newToken, newRefresh);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout
          authStore.logout();
          window.location.href = '/auth/login';
          return Promise.reject(new Error('Session expirée'));
        }
      } else {
        // No refresh token, logout
        authStore.logout();
        window.location.href = '/auth/login';
      }
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
