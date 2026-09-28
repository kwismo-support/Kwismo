import { apiClient } from '@/shared/services/apiClient';
import { lookupNumberOffline } from '@/shared/services/database';

export interface CallLogItem {
  id: string;
  phone_number: string;
  caller_name?: string;
  risk_score: number;
  statut: string;
  timestamp: string;
  is_scam: boolean;
}

export const callDetectionApi = {
  evaluateIncomingCall: async (phoneNumber: string): Promise<CallLogItem> => {
    console.log(`\x1b[35m[CALL DETECTION EVALUATION]\x1b[0m Evaluating incoming call number: "${phoneNumber}"`);
    try {
      console.log(`\x1b[36m[CALL DETECTION BACKEND REQUEST]\x1b[0m Sending POST /numbers/verify payload for:`, phoneNumber);
      const res = await apiClient.post('/numbers/verify', { valeur: phoneNumber });
      const data = res.data;
      console.log(`\x1b[32m[CALL DETECTION BACKEND RESPONSE]\x1b[0m Result:`, data);
      return {
        id: `call-${Date.now()}`,
        phone_number: data.valeur || phoneNumber,
        caller_name: data.statut === 'frauduleux' ? 'Numéro Suspect / Arnaqueur' : 'Appel Entrant',
        risk_score: data.score_risque ?? 0.85,
        statut: data.statut || 'frauduleux',
        timestamp: new Date().toISOString(),
        is_scam: data.statut === 'frauduleux' || (data.score_risque ?? 0) >= 0.7,
      };
    } catch (err) {
      console.warn(`\x1b[33m[CALL DETECTION FALLBACK]\x1b[0m Request failed. Checking offline cache:`, err);
      const cached = await lookupNumberOffline(phoneNumber);
      if (cached) {
        console.log(`\x1b[32m[CALL DETECTION CACHE HIT]\x1b[0m Cached item:`, cached);
        return {
          id: `call-offline-${Date.now()}`,
          phone_number: cached.valeur,
          caller_name: cached.statut === 'frauduleux' ? 'Numéro Suspect (Hors ligne)' : 'Appel Entrant',
          risk_score: cached.score_risque,
          statut: cached.statut || 'securise',
          timestamp: new Date().toISOString(),
          is_scam: cached.statut === 'frauduleux' || cached.score_risque >= 0.7,
        };
      }
      return {
        id: `call-sim-${Date.now()}`,
        phone_number: phoneNumber,
        caller_name: 'Inconnu (Évaluation locale)',
        risk_score: 0.88,
        statut: 'frauduleux',
        timestamp: new Date().toISOString(),
        is_scam: true,
      };
    }
  },
};
