import { Platform } from 'react-native';

export interface CachedNumber {
  valeur: string;
  score_risque: number;
  statut: string;
  updated_at: string;
}

export interface ThresholdRuleLocal {
  zone: 'securise' | 'suspect' | 'frauduleux';
  min_value: number;
  min_operator: '>=' | '>' | '=';
  max_value: number;
  max_operator: '<=' | '<' | '=';
  label_fr: string;
  label_en: string;
}

export interface OutboxItem {
  id: string;
  action_type: string; // 'report' | 'call_log' | 'whatsapp_alert'
  payload: any;
  created_at: string;
}

const STORAGE_NUMBERS_KEY = 'kwismo_sqlite_numbers_cache';
const STORAGE_CONFIG_KEY = 'kwismo_sqlite_system_config';
const STORAGE_OUTBOX_KEY = 'kwismo_sqlite_offline_outbox';

const DEFAULT_LOCAL_RULES: ThresholdRuleLocal[] = [
  { zone: 'securise', min_value: 0.0, min_operator: '>=', max_value: 0.3, max_operator: '<', label_fr: 'Sécurisé', label_en: 'Safe' },
  { zone: 'suspect', min_value: 0.3, min_operator: '>=', max_value: 0.7, max_operator: '<', label_fr: 'A vérifier / Suspect', label_en: 'Warning' },
  { zone: 'frauduleux', min_value: 0.7, min_operator: '>=', max_value: 1.0, max_operator: '<=', label_fr: 'Frauduleux / Arnaque', label_en: 'Scam' },
];

export async function initDatabase(): Promise<void> {
  // Initialisation du stockage local
  try {
    const rules = await getStoredRules();
    if (!rules || rules.length === 0) {
      await saveStoredRules(DEFAULT_LOCAL_RULES);
    }
  } catch (err) {
    console.warn('Initialisation DB locale fallback:', err);
  }
}

export async function getStoredRules(): Promise<ThresholdRuleLocal[]> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_CONFIG_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return DEFAULT_LOCAL_RULES;
}

export async function saveStoredRules(rules: ThresholdRuleLocal[]): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(rules));
    }
  } catch {}
}

export async function cacheNumbers(numbers: CachedNumber[]): Promise<void> {
  try {
    const current = await getAllCachedNumbers();
    const map = new Map<string, CachedNumber>();
    current.forEach((item) => map.set(item.valeur, item));
    numbers.forEach((item) => map.set(item.valeur, item));

    const updatedList = Array.from(map.values());
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_NUMBERS_KEY, JSON.stringify(updatedList));
    }
  } catch (err) {
    console.warn('Erreur mise en cache numéros:', err);
  }
}

export async function getAllCachedNumbers(): Promise<CachedNumber[]> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_NUMBERS_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return [];
}

export async function lookupNumberOffline(valeur: string): Promise<CachedNumber | null> {
  const all = await getAllCachedNumbers();
  const found = all.find((n) => n.valeur === valeur);
  if (!found) return null;

  // Réévaluer le statut selon les seuils locaux enregistrés
  const rules = await getStoredRules();
  const statut = evaluateScoreOffline(found.score_risque, rules);
  return { ...found, statut };
}

export function evaluateScoreOffline(score: number, rules: ThresholdRuleLocal[]): string {
  for (const r of rules) {
    const minOk = r.min_operator === '>=' ? score >= r.min_value : r.min_operator === '>' ? score > r.min_value : Math.abs(score - r.min_value) < 1e-4;
    const maxOk = r.max_operator === '<=' ? score <= r.max_value : r.max_operator === '<' ? score < r.max_value : Math.abs(score - r.max_value) < 1e-4;
    if (minOk && maxOk) {
      return r.zone;
    }
  }
  if (score >= 0.7) return 'frauduleux';
  if (score >= 0.3) return 'suspect';
  return 'securise';
}

export async function enqueueOutboxItem(action_type: string, payload: any): Promise<void> {
  try {
    const current = await getOutboxItems();
    const newItem: OutboxItem = {
      id: `outbox-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      action_type,
      payload,
      created_at: new Date().toISOString(),
    };
    current.push(newItem);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_OUTBOX_KEY, JSON.stringify(current));
    }
  } catch (err) {
    console.warn('Erreur ajout outbox:', err);
  }
}

export async function getOutboxItems(): Promise<OutboxItem[]> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_OUTBOX_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return [];
}

export async function clearOutboxItem(id: string): Promise<void> {
  try {
    const current = await getOutboxItems();
    const filtered = current.filter((item) => item.id !== id);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_OUTBOX_KEY, JSON.stringify(filtered));
    }
  } catch {}
}
