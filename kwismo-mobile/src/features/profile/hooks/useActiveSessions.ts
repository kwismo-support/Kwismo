import { useState, useEffect, useCallback } from 'react';
import i18next from 'i18next';
import { securityApi, ActiveSessionResponse } from '../services/security.api';
import { toast } from '../../../shared/store/toastStore';
import { storage } from '../../../shared/services/storage';

const DEVICES_CACHE_KEY = 'kwismo_devices_cache';

export function useActiveSessions() {
  const [sessions, setSessions] = useState<ActiveSessionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setLoading(true);
    try {
      const res = await securityApi.getActiveSessions();
      if (res.success && res.data) {
        setSessions(res.data);
        await storage.setItem(DEVICES_CACHE_KEY, JSON.stringify(res.data)).catch(() => {});
      }
    } catch (err: any) {
      if (isManualRefresh) toast.error(err.message || i18next.t('toasts.networkError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      // 1. Instant local cache load
      const cachedStr = await storage.getItem(DEVICES_CACHE_KEY);
      let hasValidCache = false;
      if (cachedStr && isMounted) {
        try {
          const parsed = JSON.parse(cachedStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSessions(parsed);
            setLoading(false);
            hasValidCache = true;
          }
        } catch {}
      }

      // 2. Only fetch network if no cache is present
      if (!hasValidCache) {
        await fetchSessions(false);
      }
      if (isMounted) setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [fetchSessions]);

  const revokeSession = async (sessionId: string, deviceName: string) => {
    try {
      const res = await securityApi.revokeSession(sessionId);
      if (res.success) {
        const updated = sessions.filter((s) => s.id !== sessionId);
        setSessions(updated);
        storage.setItem(DEVICES_CACHE_KEY, JSON.stringify(updated)).catch(() => {});
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
        const updated = sessions.filter((s) => s.is_current);
        setSessions(updated);
        storage.setItem(DEVICES_CACHE_KEY, JSON.stringify(updated)).catch(() => {});
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
    refresh: () => fetchSessions(true),
    revokeSession,
    revokeAllOthers,
  };
}
