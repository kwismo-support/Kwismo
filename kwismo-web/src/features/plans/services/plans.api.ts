import { apiClient } from '@/shared/lib/axios';

export interface SubscriptionPlanItem {
  id: string;
  code: string;
  nom_fr: string;
  nom_en: string;
  prix_fcfa: number;
  duree_jours: number;
  max_numeros: number;
  max_membres: number;
  description_fr?: string | null;
  description_en?: string | null;
  options_fr?: string[] | null;
  options_en?: string[] | null;
  badge_fr?: string | null;
  badge_en?: string | null;
  est_actif: boolean;
  ordre: number;
  created_at?: string;
  updated_at?: string;
}

export type SubscriptionPlanInput = Omit<SubscriptionPlanItem, 'id' | 'created_at' | 'updated_at'>;

export const plansApi = {
  // Public/Utilisateurs
  getActivePlans: async (): Promise<SubscriptionPlanItem[]> => {
    const res = await apiClient.get<SubscriptionPlanItem[]>('/plans/active');
    return res.data || [];
  },

  // Admin
  getAllPlansAdmin: async (): Promise<SubscriptionPlanItem[]> => {
    const res = await apiClient.get<SubscriptionPlanItem[]>('/admin/plans');
    return res.data || [];
  },

  getPlanByIdAdmin: async (id: string): Promise<SubscriptionPlanItem> => {
    const res = await apiClient.get<SubscriptionPlanItem>(`/admin/plans/${id}`);
    return res.data;
  },

  createPlanAdmin: async (payload: SubscriptionPlanInput): Promise<SubscriptionPlanItem> => {
    const res = await apiClient.post<SubscriptionPlanItem>('/admin/plans', payload);
    return res.data;
  },

  updatePlanAdmin: async (id: string, payload: Partial<SubscriptionPlanInput>): Promise<SubscriptionPlanItem> => {
    const res = await apiClient.put<SubscriptionPlanItem>(`/admin/plans/${id}`, payload);
    return res.data;
  },

  togglePlanStatusAdmin: async (id: string): Promise<SubscriptionPlanItem> => {
    const res = await apiClient.patch<SubscriptionPlanItem>(`/admin/plans/${id}/toggle`);
    return res.data;
  },

  deletePlanAdmin: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/admin/plans/${id}`);
    return res.data;
  },
};
