import { ApiClient } from '../../../shared/services/apiClient';
import { UserPhoneBackend } from '../types/management.types';

export const managementApi = {
  async listMyPhones(): Promise<{ success: boolean; data?: UserPhoneBackend[]; message?: string }> {
    try {
      const res = await ApiClient.request<UserPhoneBackend[]>('/users/me/phones', {
        method: 'GET',
        silent: true,
      });
      return {
        success: res.success,
        data: res.data || [],
        message: res.message,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Error',
      };
    }
  },

  async addPhone(valeur: string): Promise<{ success: boolean; data?: UserPhoneBackend; message?: string }> {
    try {
      const res = await ApiClient.request<UserPhoneBackend>('/users/me/phones', {
        method: 'POST',
        body: { valeur },
        silent: false,
      });
      return {
        success: res.success,
        data: res.data,
        message: res.message,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Error',
      };
    }
  },

  async verifyPhoneOtp(phoneId: string, code: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await ApiClient.request<{ message_fr?: string; message_en?: string }>(
        `/users/me/phones/${phoneId}/verify`,
        {
          method: 'POST',
          body: { code },
          silent: false,
        }
      );
      return {
        success: res.success,
        message: res.data?.message_fr || res.message,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Error',
      };
    }
  },

  async resendPhoneOtp(phoneId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await ApiClient.request<{ message_fr?: string; message_en?: string }>(
        `/users/me/phones/${phoneId}/resend`,
        {
          method: 'POST',
          silent: false,
        }
      );
      return {
        success: res.success,
        message: res.data?.message_fr || res.message,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Error',
      };
    }
  },

  async removePhone(phoneId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await ApiClient.request<{ message_fr?: string; message_en?: string }>(
        `/users/me/phones/${phoneId}`,
        {
          method: 'DELETE',
          silent: false,
        }
      );
      return {
        success: res.success,
        message: res.data?.message_fr || res.message,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Error',
      };
    }
  },

  async declarePhoneCompromised(
    phoneId: string
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const res = await ApiClient.request<any>(`/users/me/phones/${phoneId}/compromise`, {
        method: 'POST',
        silent: false,
      });
      return {
        success: res.success,
        data: res.data,
        message: res.message,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Error',
      };
    }
  },
};
