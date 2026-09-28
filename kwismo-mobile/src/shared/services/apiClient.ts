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
  private static isRefreshing = false;
  private static refreshSubscribers: ((newToken: string) => void)[] = [];

  private static async getAuthToken(): Promise<string | null> {
    return storage.getItem(env.AUTH_TOKEN_KEY);
  }

  private static onRefreshed(newToken: string) {
    this.refreshSubscribers.forEach((cb) => cb(newToken));
    this.refreshSubscribers = [];
  }

  private static addRefreshSubscriber(cb: (newToken: string) => void) {
    this.refreshSubscribers.push(cb);
  }

  private static async tryRefreshToken(): Promise<string | null> {
    try {
      const storedRefreshToken = await storage.getItem('kwismo_refresh_token');
      if (!storedRefreshToken) {
        return null;
      }

      const res = await fetch(`${env.API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ refresh_token: storedRefreshToken }),
      });

      if (!res.ok) {
        return null;
      }

      const json = await res.json().catch(() => ({}));
      const newAccessToken = json.data?.access_token || json.access_token;
      const newRefreshToken = json.data?.refresh_token || json.refresh_token;

      if (newAccessToken) {
        await storage.setItem(env.AUTH_TOKEN_KEY, newAccessToken);
        if (newRefreshToken) {
          await storage.setItem('kwismo_refresh_token', newRefreshToken);
        }
        useAuthStore.setState({
          token: newAccessToken,
          refreshToken: newRefreshToken || storedRefreshToken,
        });
        return newAccessToken;
      }
    } catch {
      return null;
    }
    return null;
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
        message: i18next.t('common.mockSuccess'),
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

      if (env.IS_DEV) {
        console.log(`\x1b[36m[API REQUEST]\x1b[0m ${method} ${url}`, body || '');
      }

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

        // Si le message est bilingue ("FR / EN"), on extrait selon la langue actuelle
        if (typeof errorMsg === 'string' && errorMsg.includes(' / ')) {
          const parts = errorMsg.split(' / ').map((p) => p.trim());
          const isEn = i18next.language?.toLowerCase().startsWith('en');
          errorMsg = isEn ? parts[1] || parts[0] : parts[0];
        }

        const errorCode = json.error_code || json.code || `HTTP_${response.status}`;
        const isAccountBlocked =
          errorCode === 'ACCOUNT_BLOCKED' ||
          errorCode === 'ACCOUNT_DELETED' ||
          json.status === 'BLOCKED' ||
          json.user_status === 'BLOCKED';

        const isAuthEndpoint =
          cleanEndpoint.includes('/auth/login') ||
          cleanEndpoint.includes('/auth/register') ||
          cleanEndpoint.includes('/auth/verify') ||
          cleanEndpoint.includes('/auth/otp') ||
          cleanEndpoint.includes('/auth/forgot') ||
          cleanEndpoint.includes('/auth/reset');

        if (
          response.status === 401 &&
          !isAuthEndpoint &&
          !cleanEndpoint.includes('/auth/refresh') &&
          !isAccountBlocked
        ) {
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            const newToken = await this.tryRefreshToken();
            this.isRefreshing = false;

            if (newToken) {
              this.onRefreshed(newToken);
              return this.request<T>(endpoint, options);
            } else {
              this.refreshSubscribers = [];
              errorMsg = i18next.t('errors.sessionExpired');
              useAuthStore.getState().logout();
            }
          } else {
            return new Promise<ApiResponse<T>>((resolve) => {
              this.addRefreshSubscriber((newToken: string) => {
                resolve(this.request<T>(endpoint, options));
              });
            });
          }
        } else if (response.status === 401 && isAuthEndpoint) {
          if (!errorMsg) {
            errorMsg = i18next.t('errors.invalidCredentials');
          }
        } else if (response.status === 401 || isAccountBlocked) {
          if (isAccountBlocked) {
            errorMsg = i18next.t('errors.accountBlocked');
          } else {
            errorMsg = i18next.t('errors.sessionExpired');
          }
          useAuthStore.getState().logout();
        } else if (response.status === 403) {
          errorMsg = errorMsg || i18next.t('errors.accessDenied');
        } else if (response.status === 404 || errorMsg === 'Not Found') {
          errorMsg = i18next.t('errors.notFound');
        } else if (response.status >= 500) {
          errorMsg = i18next.t('errors.serverError');
        } else if (!errorMsg) {
          errorMsg = i18next.t('errors.generic');
        }

        if (env.IS_DEV && !silent) {
          console.warn(`\x1b[31m[API ERROR ${response.status}]\x1b[0m ${url}:`, errorMsg, json);
        }

        if (!silent) {
          toast.error(errorMsg);
        }

        return {
          success: false,
          message: errorMsg,
          errorCode,
          status: response.status,
        };
      }

      if (env.IS_DEV) {
        console.log(`\x1b[32m[API SUCCESS ${response.status}]\x1b[0m ${url}`);
      }

      return {
        success: true,
        data: json.data !== undefined ? json.data : json,
        message: json.message || json.message_fr,
        status: response.status,
      };
    } catch (err: any) {
      const fallbackMsg = i18next.t('errors.networkError');

      if (env.IS_DEV) {
        console.error(`\x1b[31m[API NETWORK ERROR]\x1b[0m ${endpoint}:`, err);
      }

      if (!silent) {
        toast.error(fallbackMsg);
      }

      if (env.USE_MOCK_DATA && mockDataFallback !== undefined) {
        return {
          success: true,
          data: mockDataFallback,
          message: i18next.t('common.localFallback'),
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


