import { apiClient } from '@/shared/lib/axios';

export interface NumberItem {
  id: string;
  valeur: string;
  score_risque: number;
  statut: string;
  date_derniere_verification?: string;
  country_id?: string;
  operator_id?: string;
  nombre_signalements?: number;
  created_at?: string;
  updated_at?: string;
}

export interface NumbersPageResponse {
  items: NumberItem[];
  total: number;
  page?: number;
  page_size?: number;
  pages?: number;
}

export interface UserPhoneItem {
  id: string;
  valeur: string;
  country_id: string;
  operator_id?: string;
  est_verifie: boolean;
  date_verification?: string;
  est_compromis: boolean;
  created_at: string;
}

export const numbersApi = {
  getNumbers: async (
    page = 1,
    pageSize = 20,
    statut?: string,
    countryId?: string,
    operatorId?: string
  ): Promise<NumbersPageResponse> => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
      if (statut && statut !== 'ALL') params.append('statut', statut);
      if (countryId && countryId !== 'ALL') params.append('country_id', countryId);
      if (operatorId && operatorId !== 'ALL') params.append('operator_id', operatorId);

      const res = await apiClient.get(`/numbers?${params.toString()}`);
      const data = res.data;
      if (Array.isArray(data)) return { items: data, total: data.length };
      return {
        items: data.items || [],
        total: data.total || 0,
        page: data.page || page,
        page_size: data.page_size || pageSize,
        pages: data.pages || 1,
      };
    } catch {
      return { items: [], total: 0 };
    }
  },

  getNumberById: async (id: string): Promise<NumberItem | null> => {
    try {
      const res = await apiClient.get(`/numbers/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  verifyNumber: async (valeur: string, country_id?: string): Promise<NumberItem> => {
    const res = await apiClient.post('/numbers/verify', { valeur, country_id });
    return res.data;
  },

  setNumberStatus: async (id: string, statut: string, reanalyser = false): Promise<NumberItem> => {
    const res = await apiClient.patch(`/numbers/${id}/status`, { statut, reanalyser });
    return res.data;
  },

  getMyPhones: async (): Promise<UserPhoneItem[]> => {
    try {
      const res = await apiClient.get('/users/me/phones');
      return res.data || [];
    } catch {
      return [];
    }
  },

  addMyPhone: async (valeur: string): Promise<UserPhoneItem> => {
    const res = await apiClient.post('/users/me/phones', { valeur });
    return res.data;
  },

  deleteMyPhone: async (phoneId: string): Promise<void> => {
    await apiClient.delete(`/users/me/phones/${phoneId}`);
  },
};
