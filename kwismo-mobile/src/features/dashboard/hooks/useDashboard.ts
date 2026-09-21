import { useState, useEffect, useCallback } from 'react';
import { dashboardApi, DashboardSummary } from '../services/dashboard.api';
import { storage } from '../../../shared/services/storage';

const DASHBOARD_CACHE_KEY = 'kwismo_dashboard_summary_cache';

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }
    setError(null);

    try {
      const res = await dashboardApi.getSummary();
      if (res.success && res.data) {
        setSummary(res.data);
        await storage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(res.data)).catch(() => {});
      } else if (isRefresh) {
        setError(res.message || 'Error');
      }
    } catch (err: any) {
      if (isRefresh) setError(err.message || 'Network error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      // 1. Instant local cache load
      const cachedStr = await storage.getItem(DASHBOARD_CACHE_KEY);
      let hasValidCache = false;
      if (cachedStr && isMounted) {
        try {
          const parsed = JSON.parse(cachedStr);
          if (parsed && typeof parsed === 'object') {
            setSummary(parsed);
            setLoading(false);
            hasValidCache = true;
          }
        } catch {}
      }

      // 2. Only fetch network if no cache is present
      if (!hasValidCache) {
        await fetchSummary(false);
      }
      if (isMounted) setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [fetchSummary]);

  const refresh = useCallback(() => {
    return fetchSummary(true);
  }, [fetchSummary]);

  return { summary, loading, refreshing, error, refresh };
}
