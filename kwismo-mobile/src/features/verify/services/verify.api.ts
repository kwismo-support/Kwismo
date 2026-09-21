import { ApiClient } from '../../../shared/services/apiClient';
import {
  cacheNumbers,
  lookupNumberOffline,
  getStoredRules,
  evaluateScoreOffline,
} from '../../../shared/services/database';

export interface VerifyResult {
  id: string;
  valeur: string;
  phone: string;
  score_risque: number;
  riskScore: number;
  statut: 'securise' | 'suspect' | 'frauduleux' | string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  testResultType: 'secure' | 'warning' | 'danger';
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
    const cleanPhone = phone.trim();
    const rules = await getStoredRules();

    try {
      const res = await ApiClient.request<any>('/numbers/verify', {
        method: 'POST',
        body: { valeur: cleanPhone },
      });

      if (res.success && res.data) {
        const data = res.data;
        const rawScore = data.score_risque ?? 0.0;
        const normalizedScore = rawScore > 1.0 ? rawScore / 100.0 : rawScore;
        const displayScorePercent = Math.round(normalizedScore * 100);

        const evaluatedZone = evaluateScoreOffline(normalizedScore, rules);

        await cacheNumbers([
          {
            valeur: cleanPhone,
            score_risque: normalizedScore,
            operator_name: data.operator_name,
            nombre_signalements: data.nombre_signalements || 0,
            updated_at: new Date().toISOString(),
          },
        ]);

        const isDanger = evaluatedZone === 'frauduleux' || data.statut === 'frauduleux';
        const isWarning = evaluatedZone === 'suspect' || data.statut === 'a_signaler' || data.statut === 'suspect';

        const testResultType: 'secure' | 'warning' | 'danger' = isDanger
          ? 'danger'
          : isWarning
          ? 'warning'
          : 'secure';

        const level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = isDanger
          ? 'HIGH'
          : isWarning
          ? 'MEDIUM'
          : 'LOW';

        const opName = data.operator_name || 'Opérateur Mobile';

        const enrichedResult: VerifyResult = {
          id: data.id || `num-${Date.now()}`,
          valeur: data.valeur || cleanPhone,
          phone: data.valeur || cleanPhone,
          score_risque: displayScorePercent,
          riskScore: displayScorePercent,
          statut: evaluatedZone,
          riskLevel: level,
          testResultType,
          est_compromis: !!data.est_compromis || isDanger,
          nombre_signalements: data.nombre_signalements || 0,
          reportCount: data.nombre_signalements || 0,
          country_id: data.country_id,
          operator_id: data.operator_id,
          operator: opName,
          recommendation: isDanger
            ? 'Numéro à risque élevé identifié'
            : isWarning
            ? 'Activité suspecte signalée'
            : 'Aucune menace critique détectée',
        };

        return {
          success: true,
          data: enrichedResult,
        };
      }
    } catch {
    }

    const offlineItem = await lookupNumberOffline(cleanPhone);
    if (offlineItem) {
      const rawScore = offlineItem.score_risque ?? 0.0;
      const normalizedScore = rawScore > 1.0 ? rawScore / 100.0 : rawScore;
      const displayScorePercent = Math.round(normalizedScore * 100);

      const evaluatedZone = evaluateScoreOffline(normalizedScore, rules);

      const isDanger = evaluatedZone === 'frauduleux';
      const isWarning = evaluatedZone === 'suspect';

      const testResultType: 'secure' | 'warning' | 'danger' = isDanger
        ? 'danger'
        : isWarning
        ? 'warning'
        : 'secure';

      const level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = isDanger
        ? 'HIGH'
        : isWarning
        ? 'MEDIUM'
        : 'LOW';

      return {
        success: true,
        data: {
          id: `offline-${Date.now()}`,
          valeur: cleanPhone,
          phone: cleanPhone,
          score_risque: displayScorePercent,
          riskScore: displayScorePercent,
          statut: evaluatedZone,
          riskLevel: level,
          testResultType,
          est_compromis: isDanger,
          nombre_signalements: offlineItem.nombre_signalements || 0,
          reportCount: offlineItem.nombre_signalements || 0,
          operator: offlineItem.operator_name || 'Opérateur Mobile',
          recommendation: 'Évaluation calculée depuis les règles en cache local (mode hors-ligne)',
        } as VerifyResult,
      };
    }

    return {
      success: true,
      data: {
        id: `offline-def-${Date.now()}`,
        valeur: cleanPhone,
        phone: cleanPhone,
        score_risque: 0,
        riskScore: 0,
        statut: 'securise',
        riskLevel: 'LOW',
        testResultType: 'secure',
        est_compromis: false,
        nombre_signalements: 0,
        reportCount: 0,
        operator: 'Opérateur Mobile',
        recommendation: 'Aucun enregistrement local ni réseau pour ce numéro',
      } as VerifyResult,
    };
  },
};


