// Client API unifié avec internationalisation (i18n) et messages d'erreur courts & professionnels
import i18next from 'i18next';
import { env } from '../config/env';
import { toast } from '../store/toastStore';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
  status?: number;
}

export class ApiClient {
  private static async getAuthToken(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(env.AUTH_TOKEN_KEY);
      }
      return null;
    } catch {
      return null;
    }
  }

  public static async request<T = any>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
      mockDataFallback?: T;
      silent?: boolean;
    } = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', body, mockDataFallback, silent = false } = options;

    if (env.USE_MOCK_DATA) {
      return {
        success: true,
        data: mockDataFallback,
        message: i18next.t('common.mockSuccess', 'Données chargées avec succès'),
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

      const url = `${env.API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        let errorMsg = json.detail || json.message;

        if (response.status === 401) {
          errorMsg = i18next.t('errors.sessionExpired', 'Session expirée. Veuillez vous reconnecter.');
        } else if (response.status === 403) {
          errorMsg = i18next.t('errors.accessDenied', 'Accès non autorisé.');
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
        data: json.data || json,
        message: json.message,
      };
    } catch (err: any) {
      const fallbackMsg = i18next.t(
        'errors.networkError',
        'Connexion au serveur impossible. Vérifiez votre réseau.'
      );

      if (!silent) {
        toast.error(fallbackMsg);
      }

      if (mockDataFallback !== undefined) {
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
