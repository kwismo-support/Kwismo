import { storage } from './storage';
import { ApiClient } from './apiClient';
import { toast } from '../store/toastStore';

export interface QueuedAction {
  id: string;
  actionType: 'report' | 'transfer' | 'phone_add' | 'call_log' | 'whatsapp_alert' | 'generic';
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: any;
  createdAt: string;
}

const OFFLINE_QUEUE_KEY = 'kwismo_offline_outbox';
let isProcessing = false;

export const offlineQueue = {
  async getQueue(): Promise<QueuedAction[]> {
    try {
      const raw = await storage.getItem(OFFLINE_QUEUE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  },

  async enqueue(
    actionType: QueuedAction['actionType'],
    endpoint: string,
    method: QueuedAction['method'],
    payload: any,
    userMessage?: string
  ): Promise<QueuedAction> {
    const queue = await this.getQueue();
    const newAction: QueuedAction = {
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      actionType,
      endpoint,
      method,
      payload,
      createdAt: new Date().toISOString(),
    };
    queue.push(newAction);
    await storage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue)).catch(() => {});

    toast.info(
      userMessage ||
        'Action sauvegardée hors-ligne. Elle sera synchronisée automatiquement dès le retour du réseau.'
    );

    // Attempt to process queue immediately in case network just recovered
    this.processQueue().catch(() => {});
    return newAction;
  },

  async removeItem(id: string): Promise<void> {
    const queue = await this.getQueue();
    const filtered = queue.filter((item) => item.id !== id);
    await storage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered)).catch(() => {});
  },

  async processQueue(): Promise<number> {
    if (isProcessing) return 0;
    isProcessing = true;

    try {
      const queue = await this.getQueue();
      if (queue.length === 0) {
        isProcessing = false;
        return 0;
      }

      let processedCount = 0;
      const remaining: QueuedAction[] = [];

      for (const item of queue) {
        try {
          const res = await ApiClient.request(item.endpoint, {
            method: item.method,
            body: item.payload,
            silent: true,
          });

          if (res.success || res.status === 200 || res.status === 201) {
            processedCount++;
          } else if (res.errorCode === 'NETWORK_ERROR') {
            // Still offline, preserve item and pause loop
            remaining.push(item);
            const currentIdx = queue.indexOf(item);
            remaining.push(...queue.slice(currentIdx + 1));
            break;
          } else {
            // Server rejected payload (e.g. invalid syntax), discard item to prevent infinite lock
            console.warn(`[OfflineQueue] Server rejected queued item ${item.id}:`, res.message);
          }
        } catch (err) {
          remaining.push(item);
          break;
        }
      }

      await storage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining)).catch(() => {});

      if (processedCount > 0) {
        toast.success(
          `${processedCount} action(s) synchronisée(s) avec succès avec le serveur !`
        );
      }

      isProcessing = false;
      return processedCount;
    } catch {
      isProcessing = false;
      return 0;
    }
  },
};
