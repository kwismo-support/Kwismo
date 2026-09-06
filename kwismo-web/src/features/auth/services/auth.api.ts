// Authentication API service integrating login, password recovery, and token management.
import { env } from '@/config/env';
import { apiClient } from '@/shared/lib/axios';
import { toast } from '@/shared/store/toastStore';
import type { LoginInput, ForgotPasswordInput, ResetPasswordInput } from '../schemas/auth.schema';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
  login: async (data: LoginInput) => {
    if (env.useMock) {
      await delay();
      if (data.identifier.includes('fail')) {
        toast.error('auth:errors.invalidCredentials');
        throw new Error('Invalid credentials');
      }
      toast.success('auth:loginSuccess');
      return {
        token: 'mock-jwt-token-kwismo-2026',
        user: {
          id: 'usr-001',
          nom: 'Mbarga',
          prenom: 'Jean-Baptiste',
          email: data.identifier,
          role: 'admin',
        },
      };
    }
    return apiClient.post('/api/v1/auth/login', data).then((r) => {
      toast.success('auth:loginSuccess');
      return r.data;
    }).catch((err) => {
      toast.error(err.response?.data?.message ?? 'auth:errors.invalidCredentials');
      throw err;
    });
  },

  forgotPassword: async (data: ForgotPasswordInput) => {
    if (env.useMock) {
      await delay();
      toast.success('auth:emailSent');
      return { success: true };
    }
    return apiClient.post('/api/v1/auth/forgot-password', data).then((r) => {
      toast.success('auth:emailSent');
      return r.data;
    }).catch((err) => {
      toast.error(err.response?.data?.message ?? 'errors:http.serverError');
      throw err;
    });
  },

  resetPassword: async (data: ResetPasswordInput) => {
    if (env.useMock) {
      await delay();
      toast.success('auth:passwordChanged');
      return { success: true };
    }
    return apiClient.post('/api/v1/auth/reset-password', data).then((r) => {
      toast.success('auth:passwordChanged');
      return r.data;
    }).catch((err) => {
      toast.error(err.response?.data?.message ?? 'errors:http.serverError');
      throw err;
    });
  },
};
