import { settingsApi, RiskThresholdRule } from '@/features/settings/services/settings.api';

let cachedRules: RiskThresholdRule[] = [
  { zone: 'securise', min_value: 0.0, min_operator: '>=', max_value: 0.3, max_operator: '<', label_fr: 'Sécurisé', label_en: 'Safe' },
  { zone: 'suspect', min_value: 0.3, min_operator: '>=', max_value: 0.7, max_operator: '<', label_fr: 'A vérifier', label_en: 'Warning' },
  { zone: 'frauduleux', min_value: 0.7, min_operator: '>=', max_value: 1.0, max_operator: '<=', label_fr: 'Frauduleux', label_en: 'Scam' },
];

export async function fetchRiskThresholdsFromDb(): Promise<RiskThresholdRule[]> {
  try {
    const res = await settingsApi.getThresholds();
    if (res.rules && res.rules.length > 0) {
      cachedRules = res.rules;
    }
  } catch {
    //
  }
  return cachedRules;
}

export function getRiskColorConfig(score: number, rules: RiskThresholdRule[] = cachedRules) {
  const norm = score <= 1 ? score : score / 100;
  for (const rule of rules) {
    const minOk = rule.min_operator === '>=' ? norm >= rule.min_value : norm > rule.min_value;
    const maxOk = rule.max_operator === '<=' ? norm <= rule.max_value : norm < rule.max_value;
    if (minOk && maxOk) {
      if (rule.zone === 'frauduleux') {
        return { color: 'bg-rose-500', text: 'text-rose-500', variant: 'danger', label: rule.label_fr || 'Frauduleux' };
      }
      if (rule.zone === 'suspect') {
        return { color: 'bg-amber-500', text: 'text-amber-500', variant: 'warning', label: rule.label_fr || 'A vérifier' };
      }
      return { color: 'bg-emerald-500', text: 'text-emerald-500', variant: 'success', label: rule.label_fr || 'Sécurisé' };
    }
  }
  if (norm >= 0.7) return { color: 'bg-rose-500', text: 'text-rose-500', variant: 'danger', label: 'Frauduleux' };
  if (norm >= 0.3) return { color: 'bg-amber-500', text: 'text-amber-500', variant: 'warning', label: 'A vérifier' };
  return { color: 'bg-emerald-500', text: 'text-emerald-500', variant: 'success', label: 'Sécurisé' };
}
