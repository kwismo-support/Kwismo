import { useState, useEffect, useCallback } from 'react';
import i18next from 'i18next';
import { securityApi, ActiveSessionResponse } from '../services/security.api';
import { toast } from '../../../shared/store/toastStore';

export function useActiveSessions() {
  const [sessions, setSessions] = useState<ActiveSessionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await securityApi.getActiveSessions();
      if (res.success && res.data) {
        setSessions(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || i18next.t('toasts.networkError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const revokeSession = async (sessionId: string, deviceName: string) => {
    try {
      const res = await securityApi.revokeSession(sessionId);
      if (res.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        toast.success(i18next.t('security.sessionRevoked', { device: deviceName }));
      } else {
        toast.error(res.message || i18next.t('security.revokeSessionError'));
      }
    } catch (err: any) {
      toast.error(err.message || i18next.t('toasts.networkError'));
    }
  };

  const revokeAllOthers = async () => {
    try {
      const res = await securityApi.revokeAllOtherSessions();
      if (res.success) {
        setSessions((prev) => prev.filter((s) => s.is_current));
        toast.success(i18next.t('security.allOtherSessionsRevoked'));
      } else {
        toast.error(res.message || i18next.t('security.revokeSessionError'));
      }
    } catch (err: any) {
      toast.error(err.message || i18next.t('toasts.networkError'));
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
