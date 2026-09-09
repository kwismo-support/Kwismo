import { env } from '@/config/env';
import { apiClient } from '@/shared/lib/axios';
import { toast } from '@/shared/store/toastStore';
import { MOCK_USERS } from '@/shared/mock/mockUsers';
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
        localStorage.setItem('kwismo_auth_token', 'mock-jwt-token-kwismo-2026');
      } catch {}

      toast.success('auth:loginSuccess');
      return {
        token: 'mock-jwt-token-kwismo-2026',
        user: userObj,
      };
    }

    try {
      const response = await apiClient.post('/auth/login', {
        email: data.email,
        mot_de_passe: data.password,
        device_id: 'web-browser-device',
        device_name: 'Kwismo Web App',
      });

      const resData = response.data;
      const token = resData.access_token || resData.token;
      const user = resData.user || { email: data.email, role: 'admin' };

      if (token) {
        localStorage.setItem('kwismo_auth_token', token);
      }
      if (user) {
        localStorage.setItem('kwismo_user', JSON.stringify(user));
      }

      toast.success('auth:loginSuccess');
      return { token, user };
    } catch (err: any) {
      const msg = err.response?.data?.detail ?? err.response?.data?.message ?? 'Email ou mot de passe incorrect.';
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
    return apiClient.post('/partners/request', {
      nomContact: `${data.prenomContact} ${data.nomContact}`,
      email: data.email,
      nomEntreprise: data.nomEntreprise,
      typePartenariat: data.typePartenariat,
      telephone: data.telephone,
      message: data.message,
    }).then((r) => {
      toast.success('auth:partnerRegisterSuccess');
      return r.data;
    }).catch((err) => {
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
    return apiClient.post('/auth/forgot-password', { email: data.email }).then((r) => {
      toast.success('auth:emailSent');
      return r.data;
    }).catch((err) => {
      toast.error(err.response?.data?.detail ?? 'Erreur lors de la demande de réinitialisation.');
      throw err;
    });
  },

  resetPassword: async (data: ResetPasswordInput) => {
    if (env.useMock) {
      await delay();
      toast.success('auth:passwordChanged');
      return { success: true };
    }
    return apiClient.post('/auth/reset-password', {
      token: 'reset-token',
      nouveau_mot_de_passe: data.newPassword,
    }).then((r) => {
      toast.success('auth:passwordChanged');
      return r.data;
    }).catch((err) => {
      toast.error(err.response?.data?.detail ?? 'Erreur lors de la réinitialisation du mot de passe.');
      throw err;
    });
  },
};
