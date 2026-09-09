// Hook React pour récupérer et gérer la liste des cartes SIM enregistrées avec FastAPI backend
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { numbersApi, UserPhoneItem } from '../services/numbers.api';
import { toast } from '../../../shared/store/toastStore';

export function useNumbers() {
  const [numbers, setNumbers] = useState<UserPhoneItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const fetchNumbers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await numbersApi.getMyNumbers();
      if (res.success && res.data) {
        setNumbers(res.data);
      } else {
        setError(res.message || t('errors.generalMessage', 'Erreur de chargement des numéros'));
      }
    } catch (err: any) {
      setError(err.message || t('toasts.networkError', 'Erreur réseau'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchNumbers();
  }, [fetchNumbers]);

  const addSimNumber = async (numero_valeur: string, country_id: string, operator_id: string) => {
    setLoading(true);
    try {
      const res = await numbersApi.addNumber({ numero_valeur, country_id, operator_id });
      if (res.success && res.data) {
        toast.success(t('toasts.generalSuccess', 'Numéro ajouté !'));
        await fetchNumbers();
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
      if (res.success) {
        toast.success(t('toasts.generalSuccess', 'Incident déclaré !'));
        await fetchNumbers();
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { numbers, loading, error, refresh: fetchNumbers, addSimNumber, reportCompromised };
}

