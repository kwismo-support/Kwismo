import { storage } from './storage';

export interface DashboardActivity {
  id: string;
  phone: string;
  type: string;
  category: 'verified' | 'threats' | 'reports' | 'transfers';
  status: string;
  badgeType: 'green' | 'red' | 'yellow' | 'blue';
  date: string;
  timestamp: number;
  initials?: string;
  initialBg?: string;
}

const STORAGE_KEY = 'kwismo_user_activity_history_v1';

export const activityHistoryService = {
  async getActivities(): Promise<DashboardActivity[]> {
    try {
      const jsonStr = await storage.getItem(STORAGE_KEY);
      if (!jsonStr) return [];
      const list: DashboardActivity[] = JSON.parse(jsonStr);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  async addActivity(
    item: Omit<DashboardActivity, 'id' | 'date' | 'timestamp'> & {
      id?: string;
      date?: string;
      timestamp?: number;
    }
  ): Promise<void> {
    try {
      const now = Date.now();
      const dateStr = item.date || new Date(now).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });

      let initials = item.initials || undefined;
      if (initials && /^[0-9]+$/.test(initials)) {
        initials = undefined;
      }

      const newRecord: DashboardActivity = {
        id: item.id || `act-${now}-${Math.random().toString(36).substring(2, 7)}`,
        phone: item.phone,
        type: item.type,
        category: item.category,
        status: item.status,
        badgeType: item.badgeType,
        date: dateStr,
        timestamp: item.timestamp || now,
        initials,
        initialBg: item.initialBg,
      };

      const existing = await this.getActivities();
      const filtered = existing.filter((a) => a.id !== newRecord.id);
      const updated = [newRecord, ...filtered].slice(0, 100);

      await storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('[ACTIVITY HISTORY ERROR]:', err);
    }
  },

  async clearHistory(): Promise<void> {
    try {
      await storage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('[CLEAR HISTORY ERROR]:', err);
    }
  },
};
