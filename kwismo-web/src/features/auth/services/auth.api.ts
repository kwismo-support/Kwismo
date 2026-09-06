// Authentication API service integrating login, password recovery, and token management.
import { env } from '@/config/env';
import { apiClient } from '@/shared/lib/axios';
import { toast } from '@/shared/store/toastStore';
import type { LoginInput, ForgotPasswordInput, ResetPasswordInput, PartnerRegisterInput } from '../schemas/auth.schema';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
  login: async (data: LoginInput) => {
    if (env.useMock) {
      await delay();
      if (data.email.includes('fail')) {
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
          email: data.email,
          role: 'admin',
        },
      };
    }
    return apiClient.post('/auth/login', {
      email: data.email,
      mot_de_passe: data.password,
      device_id: 'web-browser-device',
      device_name: 'Kwismo Web App',
    }).then((r) => {
      toast.success('auth:loginSuccess');
      return r.data;
    }).catch((err) => {
      toast.error(err.response?.data?.message ?? 'auth:errors.invalidCredentials');
      throw err;
    });
  },

  registerPartner: async (data: PartnerRegisterInput) => {
    if (env.useMock) {
      await delay(500);
      toast.success('auth:partnerRegisterSuccess');
      return { success: true };
    }
    return apiClient.post('/auth/register', {
      nom: data.nomContact,
      prenom: data.prenomContact,
      email: data.email,
      mot_de_passe: 'DefaultPartnerPass123!',
      nomEntreprise: data.nomEntreprise,
      typePartenariat: data.typePartenariat,
      telephone: data.telephone,
      message: data.message,
    }).then((r) => {
      toast.success('auth:partnerRegisterSuccess');
      return r.data;
    }).catch((err) => {
      toast.error(err.response?.data?.message ?? 'errors:http.serverError');
      throw err;
    });
  },

  forgotPassword: async (data: ForgotPasswordInput) => {
    if (env.useMock) {
      await delay();
      toast.success('auth:emailSent');
      return { success: true };
    }
    return apiClient.post('/auth/password/forgot', data).then((r) => {
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
    return apiClient.post('/auth/password/reset', {
      token: 'reset-token',
      new_password: data.newPassword,
    }).then((r) => {
      toast.success('auth:passwordChanged');
      return r.data;
    }).catch((err) => {
      toast.error(err.response?.data?.message ?? 'errors:http.serverError');
      throw err;
    });
  },
};

