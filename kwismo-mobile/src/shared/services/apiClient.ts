// Client API unifié avec internationalisation (i18n), gestion d'authentification et éjection 401
import i18next from 'i18next';
import { env } from '../config/env';
import { storage } from './storage';
import { toast } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
  status?: number;
}

export class ApiClient {
  private static async getAuthToken(): Promise<string | null> {
    return storage.getItem(env.AUTH_TOKEN_KEY);
  }

  public static async request<T = any>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: any;
      mockDataFallback?: T;
      silent?: boolean;
    } = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', body, mockDataFallback, silent = false } = options;

    if (env.USE_MOCK_DATA && mockDataFallback !== undefined) {
      return {
        success: true,
        data: mockDataFallback,
        message: i18next.t('common.mockSuccess', 'Données chargées'),
      };
    }

    try {
      const token = await this.getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const url = `${env.API_BASE_URL}${cleanEndpoint}`;

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        let errorMsg = json.detail || json.message_fr || json.message_en || json.message;

        if (Array.isArray(errorMsg)) {
          errorMsg = errorMsg.map((e: any) => e.msg || e.detail || JSON.stringify(e)).join(', ');
        }

        if (response.status === 401) {
          errorMsg = i18next.t('errors.sessionExpired', 'Session expirée. Veuillez vous reconnecter.');
          useAuthStore.getState().logout();
        } else if (response.status === 403) {
          errorMsg = i18next.t('errors.accessDenied', 'Accès restreint.');
        } else if (response.status === 404 || errorMsg === 'Not Found') {
          errorMsg = i18next.t('errors.notFound', 'Service ou ressource introuvable.');
        } else if (response.status >= 500) {
          errorMsg = i18next.t('errors.serverError', 'Erreur serveur. Veuillez réessayer.');
        } else if (!errorMsg) {
          errorMsg = i18next.t('errors.generic', 'Une erreur est survenue.');
        }

        if (!silent) {
          toast.error(errorMsg);
        }

        return {
          success: false,
          message: errorMsg,
          errorCode: json.error_code || `HTTP_${response.status}`,
          status: response.status,
        };
      }

      return {
        success: true,
        data: json.data !== undefined ? json.data : json,
        message: json.message || json.message_fr,
        status: response.status,
      };
    } catch (err: any) {
      const fallbackMsg = i18next.t(
        'errors.networkError',
        'Connexion au serveur impossible. Vérifiez votre réseau.'
      );

      if (!silent) {
        toast.error(fallbackMsg);
      }

      if (env.USE_MOCK_DATA && mockDataFallback !== undefined) {
        return {
          success: true,
          data: mockDataFallback,
          message: i18next.t('common.localFallback', 'Données locales chargées'),
        };
      }

      return {
        success: false,
        message: fallbackMsg,
        errorCode: 'NETWORK_ERROR',
      };
    }
  }
}

export const apiClient = {
  get: (endpoint: string, options?: any) => ApiClient.request(endpoint, { method: 'GET', ...options }),
  post: (endpoint: string, body?: any, options?: any) => ApiClient.request(endpoint, { method: 'POST', body, ...options }),
  put: (endpoint: string, body?: any, options?: any) => ApiClient.request(endpoint, { method: 'PUT', body, ...options }),
  patch: (endpoint: string, body?: any, options?: any) => ApiClient.request(endpoint, { method: 'PATCH', body, ...options }),
  delete: (endpoint: string, options?: any) => ApiClient.request(endpoint, { method: 'DELETE', ...options }),
};


