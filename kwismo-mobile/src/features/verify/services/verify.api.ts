// Service API backend pour la vérification de numéro / détection de risque d'arnaque
import { ApiClient } from '../../../shared/services/apiClient';

export interface VerifyResult {
  phone: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  reportCount: number;
  operator: string;
  recommendation: string;
}

export const verifyApi = {
  async checkNumber(phone: string) {
    return ApiClient.request<VerifyResult>('/verify', {
      method: 'POST',
      body: { phone },
      mockDataFallback: {
        phone,
        riskLevel: 'LOW',
        riskScore: 15,
        reportCount: 0,
        operator: 'MTN Cameroon',
        recommendation: 'Aucune activité suspecte détectée sur ce numéro.',
      },
    });
  },
};
