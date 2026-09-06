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

  /**
   * Effectue un appel réseau HTTP unifié avec gestion automatique des tokens,
   * des erreurs et des notifications toast.
   */
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

    // Si le mode Mock est activé, renvoie les données structurées immédiatement
    if (env.USE_MOCK_DATA) {
      return {
        success: true,
        data: mockDataFallback,
        message: 'Données mockées chargées avec succès',
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
        const errorMsg = json.detail || json.message || 'Une erreur est survenue sur le serveur';
        
        if (response.status === 401 && !silent) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
        } else if (response.status === 403 && !silent) {
          toast.error('Droits insuffisants pour effectuer cette action.');
        } else if (!silent) {
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
      const isNetworkError = err?.message?.includes('Network') || err?.message?.includes('Failed to fetch');
      const fallbackMsg = isNetworkError
        ? 'Impossible de joindre le serveur. Passage automatique aux données sécurisées.'
        : 'Erreur lors de la communication avec le serveur.';

      if (!silent) {
        toast.error(fallbackMsg);
      }

      // En cas de panne serveur, bascule transparente sur le mock si disponible
      if (mockDataFallback !== undefined) {
        return {
          success: true,
          data: mockDataFallback,
          message: 'Repli sur données locales',
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
