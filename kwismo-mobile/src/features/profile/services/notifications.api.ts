import { storage } from '../../../shared/services/storage';

export interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  alertes_securite: boolean;
  mises_a_jour: boolean;
}

const NOTIF_PREFS_KEY = 'kwismo_notif_prefs';

const defaultPrefs: NotificationPreferences = {
  push_enabled: true,
  email_enabled: true,
  sms_enabled: true,
  alertes_securite: true,
  mises_a_jour: true,
};

export const notificationsApi = {
  async getPreferences() {
    try {
      const savedStr = await storage.getItem(NOTIF_PREFS_KEY);
      if (savedStr) {
        const parsed = JSON.parse(savedStr);
        return { success: true, data: { ...defaultPrefs, ...parsed } };
      }
    } catch {}
    return { success: true, data: defaultPrefs };
  },

  async updatePreferences(payload: Partial<NotificationPreferences>) {
    try {
      const current = await this.getPreferences();
      const updated = { ...current.data, ...payload };
      await storage.setItem(NOTIF_PREFS_KEY, JSON.stringify(updated));
      return { success: true, data: updated };
    } catch {}
    return { success: true, data: defaultPrefs };
  },

  async registerPushToken(token: string) {
    return { success: true, message: 'Push token registered locally' };
  },

  async unregisterPushToken(token: string) {
    return { success: true, message: 'Push token unregistered locally' };
  },
};
