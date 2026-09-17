import { useState, useEffect, useCallback } from 'react';
import { dashboardApi, DashboardSummary } from '../services/dashboard.api';

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await dashboardApi.getSummary();
      if (res.success && res.data) {
        setSummary(res.data);
      } else {
        setError(res.message || 'Error');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const refresh = useCallback(() => {
    return fetchSummary(true);
  }, [fetchSummary]);

  return { summary, loading, refreshing, error, refresh };
}
