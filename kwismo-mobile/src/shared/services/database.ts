import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface CachedNumber {
  valeur: string;
  score_risque: number;
  statut?: string;
  nombre_signalements?: number;
  operator_name?: string;
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
  action_type: string;
  payload: any;
  created_at: string;
}

const STORAGE_NUMBERS_KEY = 'kwismo_sqlite_numbers_cache';
const STORAGE_CONFIG_KEY = 'kwismo_sqlite_system_config';
const STORAGE_OUTBOX_KEY = 'kwismo_sqlite_offline_outbox';
const STORAGE_RECENTS_KEY = 'kwismo_recent_verifications';
const SECRET_KEY = 'KWISMO_CACHE_KEY_2026';

function encryptPayload(data: any): string {
  const json = JSON.stringify(data);
  let hex = '';
  for (let i = 0; i < json.length; i++) {
    const code = json.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
    hex += code.toString(16).padStart(2, '0');
  }
  return 'ENC:' + hex;
}

function decryptPayload(raw: string): any {
  if (!raw.startsWith('ENC:')) return JSON.parse(raw);
  const hex = raw.substring(4);
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    const code = parseInt(hex.substring(i, i + 2), 16) ^ SECRET_KEY.charCodeAt((i / 2) % SECRET_KEY.length);
    str += String.fromCharCode(code);
  }
  return JSON.parse(str);
}

const DEFAULT_LOCAL_RULES: ThresholdRuleLocal[] = [
  { zone: 'securise', min_value: 0.0, min_operator: '>=', max_value: 0.3, max_operator: '<', label_fr: 'Sécurisé', label_en: 'Safe' },
  { zone: 'suspect', min_value: 0.3, min_operator: '>=', max_value: 0.7, max_operator: '<', label_fr: 'A vérifier / Suspect', label_en: 'Warning' },
  { zone: 'frauduleux', min_value: 0.7, min_operator: '>=', max_value: 1.0, max_operator: '<=', label_fr: 'Frauduleux / Arnaque', label_en: 'Scam' },
];

export async function initDatabase(): Promise<void> {
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
    const raw = await AsyncStorage.getItem(STORAGE_CONFIG_KEY);
    if (raw) return decryptPayload(raw);
  } catch {}
  return DEFAULT_LOCAL_RULES;
}

export async function saveStoredRules(rules: ThresholdRuleLocal[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_CONFIG_KEY, encryptPayload(rules));
  } catch {}
}

export async function cacheNumbers(numbers: CachedNumber[]): Promise<void> {
  try {
    const current = await getAllCachedNumbers();
    const map = new Map<string, CachedNumber>();
    current.forEach((item) => map.set(item.valeur, item));
    numbers.forEach((item) => map.set(item.valeur, item));

    const updatedList = Array.from(map.values());
    await AsyncStorage.setItem(STORAGE_NUMBERS_KEY, encryptPayload(updatedList));
  } catch (err) {
    console.warn('Erreur mise en cache numéros:', err);
  }
}

export async function getAllCachedNumbers(): Promise<CachedNumber[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_NUMBERS_KEY);
    if (raw) return decryptPayload(raw);
  } catch {}
  return [];
}

export async function lookupNumberOffline(valeur: string): Promise<CachedNumber | null> {
  const all = await getAllCachedNumbers();
  const found = all.find((n) => n.valeur === valeur);
  if (!found) return null;

  const rules = await getStoredRules();
  const statut = evaluateScoreOffline(found.score_risque, rules);
  return { ...found, statut };
}

export function evaluateScoreOffline(score: number, rules: ThresholdRuleLocal[]): string {
  const normalizedScore = score > 1.0 ? score / 100.0 : score;
  for (const r of rules) {
    const minOk = r.min_operator === '>=' ? normalizedScore >= r.min_value : r.min_operator === '>' ? normalizedScore > r.min_value : Math.abs(normalizedScore - r.min_value) < 1e-4;
    const maxOk = r.max_operator === '<=' ? normalizedScore <= r.max_value : r.max_operator === '<' ? normalizedScore < r.max_value : Math.abs(normalizedScore - r.max_value) < 1e-4;
    if (minOk && maxOk) {
      return r.zone;
    }
  }
  if (normalizedScore >= 0.7) return 'frauduleux';
  if (normalizedScore >= 0.3) return 'suspect';
  return 'securise';
}

export async function getRecentVerifications(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_RECENTS_KEY);
    if (raw) return decryptPayload(raw);
  } catch {}
  return [];
}

export async function addRecentVerification(phone: string): Promise<void> {
  try {
    const current = await getRecentVerifications();
    const filtered = current.filter((p) => p !== phone);
    const updated = [phone, ...filtered].slice(0, 5);
    await AsyncStorage.setItem(STORAGE_RECENTS_KEY, encryptPayload(updated));
  } catch {}
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
    await AsyncStorage.setItem(STORAGE_OUTBOX_KEY, encryptPayload(current));
  } catch (err) {
    console.warn('Erreur ajout outbox:', err);
  }
}

export async function getOutboxItems(): Promise<OutboxItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_OUTBOX_KEY);
    if (raw) return decryptPayload(raw);
  } catch {}
  return [];
}

export async function clearOutboxItem(id: string): Promise<void> {
  try {
    const current = await getOutboxItems();
    const filtered = current.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_OUTBOX_KEY, encryptPayload(filtered));
  } catch {}
}

export async function syncOfflineOutbox(
  handler: (item: OutboxItem) => Promise<boolean>
): Promise<number> {
  const items = await getOutboxItems();
  if (items.length === 0) return 0;
  let synced = 0;
  for (const item of items) {
    try {
      const ok = await handler(item);
      if (ok) {
        await clearOutboxItem(item.id);
        synced++;
      }
    } catch {}
  }
  return synced;
}
