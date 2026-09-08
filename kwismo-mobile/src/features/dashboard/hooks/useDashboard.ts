// Hook React pour récupérer et rafraîchir les données du tableau de bord
import { useState, useEffect, useCallback } from 'react';
import { dashboardApi, DashboardSummary } from '../services/dashboard.api';

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getSummary();
      if (res.success && res.data) {
        setSummary(res.data);
      } else {
        setError(res.message || 'Erreur lors du chargement des données');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refresh: fetchSummary };
}
