import { env } from '@/config/env';
import { apiClient } from '@/shared/lib/axios';
import { toast } from '@/shared/store/toastStore';

export interface UserPhone {
  id: string;
  valeur: string;
  verifie: boolean;
  compromis: boolean;
  date_ajout?: string;
  createdAt?: string;
}

export interface CompromiseIncident {
  id: string;
  phone_id: string;
  type_incident: string;
  description: string;
  createdAt: string;
}

export interface UserProfilePayload {
  nom?: string;
  prenom?: string;
  langue?: string;
}

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_PHONES: UserPhone[] = [
  { id: 'ph-001', valeur: '+237690000001', verifie: true, compromis: false, date_ajout: '2026-01-15T10:00:00Z' },
  { id: 'ph-002', valeur: '+237670000002', verifie: false, compromis: false, date_ajout: '2026-02-01T14:30:00Z' },
];

export const userApi = {
  getMyPhones: async (): Promise<UserPhone[]> => {
    if (env.useMock) {
      await delay();
      return MOCK_PHONES;
    }
    const res = await apiClient.get('/users/me/phones');
    return res.data;
  },

  addMyPhone: async (valeur: string): Promise<UserPhone> => {
    if (env.useMock) {
      await delay();
      const newPhone: UserPhone = {
        id: `ph-${Date.now()}`,
        valeur,
        verifie: false,
        compromis: false,
        date_ajout: new Date().toISOString(),
      };
      MOCK_PHONES.push(newPhone);
      toast.success('user:toast.phoneAdded');
      return newPhone;
    }
    try {
      const res = await apiClient.post('/users/me/phones', { valeur });
      toast.success('user:toast.phoneAdded');
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.detail ?? err.message ?? 'Erreur lors de l\'ajout du numéro.';
      toast.error(msg);
      throw err;
    }
  },

  verifyMyPhone: async (phoneId: string, code: string): Promise<void> => {
    if (env.useMock) {
      await delay();
      const ph = MOCK_PHONES.find((p) => p.id === phoneId);
      if (ph) ph.verifie = true;
      toast.success('user:toast.phoneVerified');
      return;
    }
    try {
      await apiClient.post(`/users/me/phones/${phoneId}/verify`, { code });
      toast.success('user:toast.phoneVerified');
    } catch (err: any) {
      const msg = err.response?.data?.detail ?? err.message ?? 'Code OTP invalide.';
      toast.error(msg);
      throw err;
    }
  },

  resendMyPhoneOtp: async (phoneId: string): Promise<void> => {
    if (env.useMock) {
      await delay();
      toast.success('user:toast.otpResent');
      return;
    }
    try {
      await apiClient.post(`/users/me/phones/${phoneId}/resend`);
      toast.success('user:toast.otpResent');
    } catch (err: any) {
      const msg = err.response?.data?.detail ?? err.message ?? 'Erreur lors de l\'envoi de l\'OTP.';
      toast.error(msg);
      throw err;
    }
  },

  removeMyPhone: async (phoneId: string): Promise<void> => {
    if (env.useMock) {
      await delay();
      const idx = MOCK_PHONES.findIndex((p) => p.id === phoneId);
      if (idx !== -1) MOCK_PHONES.splice(idx, 1);
      toast.success('user:toast.phoneRemoved');
      return;
    }
    try {
      await apiClient.delete(`/users/me/phones/${phoneId}`);
      toast.success('user:toast.phoneRemoved');
    } catch (err: any) {
      const msg = err.response?.data?.detail ?? err.message ?? 'Erreur lors de la suppression du numéro.';
      toast.error(msg);
      throw err;
    }
  },

  compromiseMyPhone: async (phoneId: string, typeIncident: string, description: string): Promise<CompromiseIncident> => {
    if (env.useMock) {
      await delay();
      const ph = MOCK_PHONES.find((p) => p.id === phoneId);
      if (ph) ph.compromis = true;
      toast.success('user:toast.compromiseDeclared');
      return {
        id: `inc-${Date.now()}`,
        phone_id: phoneId,
        type_incident: typeIncident,
        description,
        createdAt: new Date().toISOString(),
      };
    }
    try {
      const res = await apiClient.post(`/users/me/phones/${phoneId}/compromise`, {
        type_incident: typeIncident,
        description,
      });
      toast.success('user:toast.compromiseDeclared');
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.detail ?? err.message ?? 'Erreur lors de la déclaration d\'incident.';
      toast.error(msg);
      throw err;
    }
  },

  updateMyProfile: async (payload: UserProfilePayload): Promise<any> => {
    if (env.useMock) {
      await delay();
      toast.success('user:toast.profileUpdated');
      return payload;
    }
    try {
      const res = await apiClient.patch('/users/me', payload);
      toast.success('user:toast.profileUpdated');
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.detail ?? err.message ?? 'Erreur lors de la mise à jour du profil.';
      toast.error(msg);
      throw err;
    }
  },

  verifyPublicNumber: async (valeur: string): Promise<any> => {
    if (env.useMock) {
      await delay();
      return {
        id: 'num-001',
        valeur,
        statut: 'verified',
        op: { nomMatricule: 'Orange Cameroon' },
        scoreConfiance: 95,
      };
    }
    try {
      const res = await apiClient.get('/numbers/verify', { params: { valeur } });
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.detail ?? err.message ?? 'Numéro non trouvé ou invalide.';
      toast.error(msg);
      throw err;
    }
  },

  reportFraud: async (payload: { telephone_suspect: string; type_fraude: string; description: string }): Promise<any> => {
    if (env.useMock) {
      await delay();
      toast.success('user:toast.reportSubmitted');
      return { id: `rep-${Date.now()}`, ...payload };
    }
    try {
      const res = await apiClient.post('/reports', payload);
      toast.success('user:toast.reportSubmitted');
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.detail ?? err.message ?? 'Erreur lors du signalement.';
      toast.error(msg);
      throw err;
    }
  },
};
