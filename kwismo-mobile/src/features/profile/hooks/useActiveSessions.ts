import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { securityApi, ActiveSessionResponse } from '../services/security.api';
import { toast } from '../../../shared/store/toastStore';

export function useActiveSessions() {
  const [sessions, setSessions] = useState<ActiveSessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await securityApi.getActiveSessions();
      if (res.success && res.data) {
        setSessions(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || t('toasts.networkError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const revokeSession = async (sessionId: string, deviceName: string) => {
    try {
      const res = await securityApi.revokeSession(sessionId);
      if (res.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        toast.success(t('security.sessionRevoked', { device: deviceName }));
      } else {
        toast.error(res.message || t('security.revokeSessionError'));
      }
    } catch (err: any) {
      toast.error(err.message || t('toasts.networkError'));
    }
  };

  const revokeAllOthers = async () => {
    try {
      const res = await securityApi.revokeAllOtherSessions();
      if (res.success) {
        setSessions((prev) => prev.filter((s) => s.is_current));
        toast.success(t('security.allOtherSessionsRevoked'));
      } else {
        toast.error(res.message || t('security.revokeSessionError'));
      }
    } catch (err: any) {
      toast.error(err.message || t('toasts.networkError'));
    }
  };

  return {
    sessions,
    loading,
    refresh: fetchSessions,
    revokeSession,
    revokeAllOthers,
  };
}
