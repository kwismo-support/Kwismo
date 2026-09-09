import { apiClient } from '@/shared/lib/axios';

export interface RiskThresholdRule {
  zone: 'securise' | 'suspect' | 'frauduleux';
  min_value: number;
  min_operator: '>=' | '>' | '=';
  max_value: number;
  max_operator: '<=' | '<' | '=';
  label_fr: string;
  label_en: string;
}

export interface SettingsThresholdsOut {
  rules: RiskThresholdRule[];
  updated_at?: string;
}

export const settingsApi = {
  getThresholds: async (): Promise<SettingsThresholdsOut> => {
    try {
      const res = await apiClient.get<SettingsThresholdsOut>('/settings/thresholds');
      return res.data;
    } catch (err) {
      console.warn('Fallback local rules:', err);
      return {
        rules: [
          { zone: 'securise', min_value: 0.0, min_operator: '>=', max_value: 0.3, max_operator: '<', label_fr: 'Sécurisé', label_en: 'Safe' },
          { zone: 'suspect', min_value: 0.3, min_operator: '>=', max_value: 0.7, max_operator: '<', label_fr: 'A vérifier / Suspect', label_en: 'Warning / Suspect' },
          { zone: 'frauduleux', min_value: 0.7, min_operator: '>=', max_value: 1.0, max_operator: '<=', label_fr: 'Frauduleux / Arnaque', label_en: 'Fraudulent / Scam' },
        ]
      };
    }
  },

  updateThresholds: async (rules: RiskThresholdRule[]): Promise<SettingsThresholdsOut> => {
    const res = await apiClient.put<SettingsThresholdsOut>('/settings/thresholds', { rules });
    return res.data;
  }
};
