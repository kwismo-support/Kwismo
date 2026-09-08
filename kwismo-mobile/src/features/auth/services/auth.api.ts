// Service d'appel API backend pour le module Authentification
import { ApiClient } from '../../../shared/services/apiClient';
import { LoginPayload, RegisterPayload, VerifyOtpPayload, AuthResponse } from '../schemas/auth.schema';

export const authApi = {
  async login(payload: LoginPayload) {
    return ApiClient.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload,
      mockDataFallback: {
        token: 'mock_jwt_token',
        user: { id: 'usr-1', fullName: 'Utilisateur KWISMO', email: 'user@kwismo.cm', phone: '+237690000000', isVerified: true },
      },
    });
  },

  async register(payload: RegisterPayload) {
    return ApiClient.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: payload,
      mockDataFallback: {
        token: 'mock_jwt_token',
        user: { id: 'usr-1', fullName: payload.fullName, email: payload.email, phone: payload.phone, isVerified: false },
      },
    });
  },

  async verifyOtp(payload: VerifyOtpPayload) {
    return ApiClient.request<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: payload,
      mockDataFallback: {
        token: 'mock_jwt_token',
        user: { id: 'usr-1', fullName: 'Utilisateur KWISMO', email: payload.phoneOrEmail, phone: payload.phoneOrEmail, isVerified: true },
      },
    });
  },

  async resendOtp(phoneOrEmail: string) {
    return ApiClient.request<{ message: string }>('/auth/resend-otp', {
      method: 'POST',
      body: { phoneOrEmail },
      mockDataFallback: { message: 'Code OTP renvoyé avec succès.' },
    });
  },
};
