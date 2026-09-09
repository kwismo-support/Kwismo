// Service d'appel API backend pour le module Authentification
import { ApiClient } from '../../../shared/services/apiClient';
import {
  LoginPayload,
  RegisterPayload,
  VerifyEmailPayload,
  TokenOut,
  DeviceVerificationRequiredOut,
} from '../schemas/auth.schema';

export const authApi = {
  async login(payload: LoginPayload) {
    return ApiClient.request<TokenOut | DeviceVerificationRequiredOut>('/auth/login', {
      method: 'POST',
      body: payload,
    });
  },

  async register(payload: RegisterPayload) {
    return ApiClient.request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: payload,
    });
  },

  async verifyEmail(payload: VerifyEmailPayload) {
    return ApiClient.request<TokenOut>('/auth/email/verify', {
      method: 'POST',
      body: payload,
    });
  },

  async resendEmailOtp(email: string) {
    return ApiClient.request<{ message: string }>('/auth/email/resend', {
      method: 'POST',
      body: { email },
    });
  },

  async forgotPassword(email: string) {
    return ApiClient.request<{ message: string }>('/auth/password/forgot', {
      method: 'POST',
      body: { email },
    });
  },

  async resetPassword(token: string, new_password: string) {
    return ApiClient.request<{ message: string }>('/auth/password/reset', {
      method: 'POST',
      body: { token, new_password },
    });
  },

  async logout(refresh_token: string) {
    return ApiClient.request<{ message: string }>('/auth/logout', {
      method: 'POST',
      body: { refresh_token },
    });
  },
};

