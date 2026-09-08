// Hook React pour récupérer et gérer la liste des cartes SIM enregistrées
import { useState, useEffect, useCallback } from 'react';
import { numbersApi, SimNumber } from '../services/numbers.api';

export function useNumbers() {
  const [numbers, setNumbers] = useState<SimNumber[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNumbers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await numbersApi.getMyNumbers();
      if (res.success && res.data) {
        setNumbers(res.data);
      } else {
        setError(res.message || 'Erreur lors de la récupération des numéros');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNumbers();
  }, [fetchNumbers]);

  const addSimNumber = async (phone: string, operator: string) => {
    setLoading(true);
    try {
      const res = await numbersApi.addNumber({ phone, operator });
      if (res.success && res.data) {
        setNumbers((prev) => [...prev, res.data!]);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const reportCompromised = async (id: string) => {
    setLoading(true);
    try {
      const res = await numbersApi.markAsCompromised(id);
      if (res.success && res.data) {
        setNumbers((prev) =>
          prev.map((num) => (num.id === id ? { ...num, status: 'compromised' } : num))
        );
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { numbers, loading, error, refresh: fetchNumbers, addSimNumber, reportCompromised };
}
