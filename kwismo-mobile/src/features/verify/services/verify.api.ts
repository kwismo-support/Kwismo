// Service API backend pour la vérification de numéro avec FastAPI backend (/numbers/verify)
import { ApiClient } from '../../../shared/services/apiClient';

export interface VerifyResult {
  id: string;
  valeur: string;
  phone: string;
  score_risque: number;
  riskScore: number;
  statut: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  est_compromis: boolean;
  nombre_signalements: number;
  reportCount: number;
  operator?: string;
  country_id?: string;
  operator_id?: string;
  recommendation?: string;
}

export const verifyApi = {
  async checkNumber(phone: string) {
    const res = await ApiClient.request<any>('/numbers/verify', {
      method: 'POST',
      body: { valeur: phone.trim() },
    });

    if (res.success && res.data) {
      const data = res.data;
      const score = data.score_risque ?? 0;
      const level = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';

      const enrichedResult: VerifyResult = {
        id: data.id || `num-${Date.now()}`,
        valeur: data.valeur || phone,
        phone: data.valeur || phone,
        score_risque: score,
        riskScore: score,
        statut: data.statut || 'active',
        riskLevel: level,
        est_compromis: !!data.est_compromis,
        nombre_signalements: data.nombre_signalements || 0,
        reportCount: data.nombre_signalements || 0,
        country_id: data.country_id,
        operator_id: data.operator_id,
        operator: data.operator_id || 'Opérateur Mobile',
        recommendation: level === 'HIGH' ? 'Numéro suspect détecté par la communauté' : 'Aucune menace critique détectée',
      };

      return {
        success: true,
        data: enrichedResult,
      };
    }

    return res;
  },
};


