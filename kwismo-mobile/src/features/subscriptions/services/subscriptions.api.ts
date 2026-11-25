import { apiClient } from '@/shared/services/apiClient';
import type { SubscriptionPlanItem, UserSubscriptionState, FamilyMemberItem } from '../types/subscription.types';

export const subscriptionsApi = {
  // Récupérer les formules actives configurées par l'administrateur
  getActivePlans: async (): Promise<SubscriptionPlanItem[]> => {
    const res = await apiClient.get('/plans/active');
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  // Récupérer l'état actuel de l'abonnement de l'utilisateur
  getUserSubscription: async (): Promise<UserSubscriptionState | null> => {
    const res = await apiClient.get('/subscriptions/me');
    if (res.success && res.data) {
      return res.data;
    }
    return null;
  },

  // Simuler ou exécuter la souscription / paiement Mobile Money
  subscribe: async (payload: {
    plan_id: string;
    operator: 'orange_money' | 'mtn_momo' | 'wave' | 'card';
    phone_number: string;
  }): Promise<{ success: boolean; message: string; transactionId?: string; ussdCode?: string }> => {
    const res = await apiClient.post('/subscriptions/subscribe', payload);
    if (res.success) {
      return {
        success: true,
        message: res.message || 'Souscription validée avec succès.',
        transactionId: res.data?.transaction_id,
        ussdCode: res.data?.ussd_code,
      };
    }
    return {
      success: false,
      message: res.message || 'Échec de la transaction.',
    };
  },

  // Gestion des membres du Pack Famille
  inviteMember: async (phoneNumber: string, name?: string): Promise<{ success: boolean; member?: FamilyMemberItem; message: string }> => {
    const res = await apiClient.post('/family/invite', { phone_number: phoneNumber, name });
    if (res.success) {
      return {
        success: true,
        member: res.data,
        message: res.message || 'Membre invité avec succès.',
      };
    }
    return {
      success: false,
      message: res.message || "Impossible d'inviter ce numéro.",
    };
  },

  removeMember: async (memberId: string): Promise<boolean> => {
    const res = await apiClient.delete(`/family/members/${memberId}`);
    return res.success;
  },
};
