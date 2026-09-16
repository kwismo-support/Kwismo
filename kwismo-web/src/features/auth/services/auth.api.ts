import { env } from '@/config/env';
import { ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/shared/lib/axios';
import { toast } from '@/shared/store/toastStore';
import { MOCK_USERS } from '@/shared/mock/mockUsers';
import { setAuthTokens, getDeviceId } from '@/shared/lib/token';
import { useLanguageStore } from '@/shared/store/languageStore';
import type { LoginInput, ForgotPasswordInput, ResetPasswordInput, PartnerRegisterInput } from '../schemas/auth.schema';
import { useAuthStore } from '@/shared/store/authStore';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export interface LoginResult {
  requiresDeviceVerification?: boolean;
  message?: string;
  email?: string;
  deviceId?: string;
  token?: string;
  user?: any;
}

export const authApi = {
  login: async (data: LoginInput): Promise<LoginResult> => {
    if (env.useMock) {
      await delay();
      if (data.email.includes('fail')) {
        toast.error('auth:errors.invalidCredentials');
        throw new Error('Invalid credentials');
      }

      const foundUser = MOCK_USERS.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
      const role = foundUser ? foundUser.role.nomRole : 'admin';
      const userObj = {
        id: foundUser ? foundUser.id : 'usr-001',
        nom: foundUser ? foundUser.nom : 'Mbarga',
        prenom: foundUser ? foundUser.prenom : 'Jean-Baptiste',
        email: data.email,
        role,
        partnerId: foundUser?.partnerId,
        partnerName: foundUser?.partner?.nomEntreprise,
      };

      try {
        localStorage.setItem('kwismo_user', JSON.stringify(userObj));
        setAuthTokens('mock-jwt-token-kwismo-2026', 'mock-refresh-token-kwismo-2026');
      } catch {}

      toast.success('auth:loginSuccess');
      return {
        token: 'mock-jwt-token-kwismo-2026',
        user: userObj,
      };
    }

    try {
      const currentLang = useLanguageStore.getState().lang || 'fr';
      const deviceId = getDeviceId();
      const response = await apiClient.post(ENDPOINTS.auth.login, {
        email: data.email,
        mot_de_passe: data.password,
        device_id: deviceId,
        device_name: 'Kwismo Web App',
        lang: currentLang,
      });

      const resData = response.data;

      // Cas où un nouvel appareil requiert une vérification OTP
      if (resData.requires_device_verification) {
        const msg = currentLang === 'en' ? resData.message_en : resData.message_fr;
        toast.success(msg || 'Nouvel appareil détecté. Un code OTP a été envoyé.');
        return {
          requiresDeviceVerification: true,
          message: msg,
          email: data.email,
          deviceId,
        };
      }

      const token = resData.access_token;
      const refreshToken = resData.refresh_token;
      const user = resData.user;

      if (token) {
        setAuthTokens(token, refreshToken);
      }
      if (user) {
        localStorage.setItem('kwismo_user', JSON.stringify(user));
      }

      toast.success('auth:loginSuccess');
      return { token, user };
    } catch (err: any) {
      const msg = err.response?.data?.detail ?? err.message ?? 'Email ou mot de passe incorrect.';
      toast.error(msg);
      throw err;
    }
  },

  verifyDevice: async (email: string, code: string, deviceId: string) => {
    if (env.useMock) {
      await delay();
      toast.success('auth:loginSuccess');
      return { token: 'mock-jwt-token-kwismo-2026', user: { email, role: 'user' } };
    }

    try {
      const response = await apiClient.post(ENDPOINTS.auth.deviceVerify, {
        email,
        code,
        device_id: deviceId,
      });

      const { access_token, refresh_token, user } = response.data;
      if (access_token) {
        setAuthTokens(access_token, refresh_token);
      }
      if (user) {
        localStorage.setItem('kwismo_user', JSON.stringify(user));
      }
      toast.success('auth:loginSuccess');
      return { token: access_token, user };
    } catch (err: any) {
      const msg = err.response?.data?.detail ?? err.message ?? 'Code de vérification invalide.';
      toast.error(msg);
      throw err;
    }
  },

  registerPartner: async (data: PartnerRegisterInput) => {
    if (env.useMock) {
      await delay(500);
      toast.success('auth:partnerRegisterSuccess');
      return { success: true };
    }
    return apiClient
      .post('/partners/request', {
        nomContact: `${data.prenomContact} ${data.nomContact}`,
        email: data.email,
        nomEntreprise: data.nomEntreprise,
        typePartenariat: data.typePartenariat,
        telephone: data.telephone,
        message: data.message,
      })
      .then((r) => {
        toast.success('auth:partnerRegisterSuccess');
        return r.data;
      })
      .catch((err) => {
        toast.error(err.response?.data?.detail ?? 'Erreur lors de la soumission de la demande.');
        throw err;
      });
  },

  forgotPassword: async (data: ForgotPasswordInput) => {
    if (env.useMock) {
      await delay();
      toast.success('auth:emailSent');
      return { success: true };
    }

    const currentLang = useLanguageStore.getState().lang || 'fr';
    return apiClient
      .post(ENDPOINTS.auth.forgotPassword, {
        email: data.email,
        lang: currentLang,
      })
      .then((r) => {
        toast.success(r.data?.message ?? 'auth:emailSent');
        return r.data;
      })
      .catch((err) => {
        toast.error(err.response?.data?.detail ?? err.message ?? 'Erreur lors de la demande de réinitialisation.');
        throw err;
      });
  },

  resetPassword: async (data: ResetPasswordInput, token: string) => {
    if (env.useMock) {
      await delay();
      toast.success('auth:passwordChanged');
      return { success: true };
    }
    return apiClient
      .post(ENDPOINTS.auth.resetPassword, {
        token,
        new_password: data.newPassword,
      })
      .then((r) => {
        toast.success(r.data?.message ?? 'auth:passwordChanged');
        return r.data;
      })
      .catch((err) => {
        toast.error(err.response?.data?.detail ?? err.message ?? 'Erreur lors de la réinitialisation du mot de passe.');
        throw err;
      });
  },
};

