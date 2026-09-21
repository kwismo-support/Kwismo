import { useState, useEffect, useCallback } from 'react';
import { notificationsApi, NotificationPreferences } from '../services/notifications.api';
import { storage } from '../../../shared/services/storage';

const NOTIF_PREFS_KEY = 'kwismo_notif_prefs';

const defaultPrefs: NotificationPreferences = {
  push_enabled: true,
  email_enabled: true,
  sms_enabled: true,
  alertes_securite: true,
  mises_a_jour: true,
};

export function useNotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPrefs);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const savedStr = await storage.getItem(NOTIF_PREFS_KEY);
      if (savedStr) {
        try {
          const parsed = JSON.parse(savedStr);
          setPreferences({ ...defaultPrefs, ...parsed });
        } catch {}
      }

      const res = await notificationsApi.getPreferences();
      if (res.success && res.data) {
        setPreferences(res.data);
        await storage.setItem(NOTIF_PREFS_KEY, JSON.stringify(res.data));
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    await storage.setItem(NOTIF_PREFS_KEY, JSON.stringify(updated)).catch(() => {});
    try {
      await notificationsApi.updatePreferences({ [key]: value });
    } catch {
    }
  };

  const registerPushToken = async (token: string) => {
    try {
      await notificationsApi.registerPushToken(token);
    } catch {}
  };

  const unregisterPushToken = async (token: string) => {
    try {
      await notificationsApi.unregisterPushToken(token);
    } catch {}
  };

  return {
    preferences,
    loading,
    updatePreference,
    registerPushToken,
    unregisterPushToken,
    refresh: fetchPreferences,
  };
}
