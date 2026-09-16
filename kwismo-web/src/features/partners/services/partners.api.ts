import { apiClient } from '@/shared/lib/axios';

export interface AffiliationRulePrefix {
  id: string;
  prefixe: string;
}

export interface AffiliationRule {
  id: string;
  partner_id: string;
  country_id: string;
  prefixes: AffiliationRulePrefix[];
}

export interface PartnerKpiSummary {
  numeros_affilies: number;
  signalements_perimetre: number;
  taux_fraude_perimetre: number;
}

export interface PartnerItem {
  id: string;
  nom_entreprise: string;
  type_partenariat: string;
  date_adhesion: string;
  createdAt?: string;
  usersCount?: number;
  numbersCount?: number;
  kpi?: PartnerKpiSummary;
}

export interface PartnersPageResponse {
  items: PartnerItem[];
  total: number;
  page?: number;
  page_size?: number;
  pages?: number;
}

export interface PartnerScopeNumber {
  id: string;
  valeur: string;
  statut: string;
  score_risque: number;
}

export interface PartnerScopeUser {
  id: string;
  nom: string;
  prenom: string;
  nombre_numeros: number;
}

export const partnersApi = {
  getPartners: async (page = 1, pageSize = 50): Promise<PartnersPageResponse> => {
    try {
      const res = await apiClient.get(`/partners?page=${page}&page_size=${pageSize}`);
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

  getPartnerById: async (id: string): Promise<PartnerItem | null> => {
    try {
      const res = await apiClient.get(`/partners/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  createPartner: async (payload: { nom_entreprise: string; type_partenariat: string }): Promise<PartnerItem> => {
    const res = await apiClient.post('/partners', payload);
    return res.data;
  },

  getAffiliationRules: async (partnerId: string): Promise<AffiliationRule[]> => {
    try {
      const res = await apiClient.get(`/partners/${partnerId}/affiliation-rules`);
      return res.data || [];
    } catch {
      return [];
    }
  },

  addAffiliationRule: async (partnerId: string, payload: { country_id: string; prefixes: string[] }): Promise<AffiliationRule> => {
    const res = await apiClient.post(`/partners/${partnerId}/affiliation-rules`, payload);
    return res.data;
  },

  getScopeNumbers: async (page = 1, pageSize = 20): Promise<{ items: PartnerScopeNumber[]; total: number }> => {
    try {
      const res = await apiClient.get(`/partner/scope/numbers?page=${page}&page_size=${pageSize}`);
      const data = res.data;
      if (Array.isArray(data)) return { items: data, total: data.length };
      return { items: data.items || [], total: data.total || 0 };
    } catch {
      return { items: [], total: 0 };
    }
  },

  getScopeUsers: async (page = 1, pageSize = 20): Promise<{ items: PartnerScopeUser[]; total: number }> => {
    try {
      const res = await apiClient.get(`/partner/scope/users?page=${page}&page_size=${pageSize}`);
      const data = res.data;
      if (Array.isArray(data)) return { items: data, total: data.length };
      return { items: data.items || [], total: data.total || 0 };
    } catch {
      return { items: [], total: 0 };
    }
  },
};
