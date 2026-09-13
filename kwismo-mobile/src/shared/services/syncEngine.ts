import { apiClient } from './apiClient';
import {
  cacheNumbers,
  saveStoredRules,
  getOutboxItems,
  clearOutboxItem,
  CachedNumber,
} from './database';
import { storage } from './storage';

const LAST_SYNC_KEY = 'kwismo_last_sync_timestamp';

export async function syncDelta(): Promise<void> {
  try {
    let lastSync = await storage.getItem(LAST_SYNC_KEY);
    const url = lastSync ? `/numbers/sync?since=${encodeURIComponent(lastSync)}` : '/numbers/sync';
    
    const res = await apiClient.get(url);
    if (res.data) {
      const { items, threshold_rules, synced_at } = res.data;
      if (Array.isArray(items) && items.length > 0) {
        const cachedItems: CachedNumber[] = items.map((n: any) => ({
          valeur: n.valeur,
          score_risque: n.score_risque,
          statut: n.statut,
          updated_at: n.date_derniere_verification || synced_at,
        }));
        await cacheNumbers(cachedItems);
      }
      if (Array.isArray(threshold_rules) && threshold_rules.length > 0) {
        await saveStoredRules(threshold_rules);
      }
      if (synced_at) {
        await storage.setItem(LAST_SYNC_KEY, synced_at);
      }
    }
  } catch (err) {
    console.warn('Synchro delta hors ligne ou serveur indisponible:', err);
  }
}

export async function processOutbox(): Promise<void> {
  try {
    const items = await getOutboxItems();
    if (items.length === 0) return;

    for (const item of items) {
      try {
        if (item.action_type === 'report') {
          await apiClient.post('/reports', item.payload);
        } else if (item.action_type === 'whatsapp_alert') {
          await apiClient.post('/whatsapp-alerts/broadcast', item.payload);
        }
        await clearOutboxItem(item.id);
      } catch (err: any) {
        if (err?.response?.status === 409) {
          await clearOutboxItem(item.id);
        } else {
          console.warn(`Échec synchro outbox (${item.action_type}):`, err);
        }
      }
    }
  } catch (err) {
    console.warn('Erreur traitement file outbox:', err);
  }
}
