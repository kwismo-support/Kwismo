import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { notificationsApi, NotificationPreferences } from '../services/notifications.api';
import { toast } from '../../../shared/store/toastStore';

export function useNotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    push_enabled: true,
    email_enabled: true,
    sms_enabled: true,
    alertes_securite: true,
    mises_a_jour: true,
  });
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.getPreferences();
      if (res.success && res.data) {
        setPreferences(res.data);
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
    try {
      const res = await notificationsApi.updatePreferences({ [key]: value });
      if (!res.success) {
        setPreferences(preferences);
        toast.error(res.message || t('notifications.updateError'));
      }
    } catch (err: any) {
      setPreferences(preferences);
      toast.error(err.message || t('toasts.networkError'));
    }
  };

  const registerPushToken = async (token: string) => {
    try {
      await notificationsApi.registerPushToken(token);
    } catch {
    }
  };

  const unregisterPushToken = async (token: string) => {
    try {
      await notificationsApi.unregisterPushToken(token);
    } catch {
    }
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
