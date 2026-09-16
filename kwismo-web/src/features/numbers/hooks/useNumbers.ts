import { useState, useEffect, useCallback } from 'react';
import { numbersApi, type NumberItem } from '../services/numbers.api';
import { toast } from '@/shared/store/toastStore';
import { useTranslation } from 'react-i18next';

export function useNumbers() {
  const { t } = useTranslation('admin');
  const [numbers, setNumbers] = useState<NumberItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statutFilter, setStatutFilter] = useState('ALL');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [operatorFilter, setOperatorFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNumbers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await numbersApi.getNumbers(page, pageSize, statutFilter, countryFilter, operatorFilter);
      setNumbers(res.items);
      setTotal(res.total);
    } catch {
      toast.error(t('numbers.toasts.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statutFilter, countryFilter, operatorFilter, t]);

  useEffect(() => {
    fetchNumbers();
  }, [fetchNumbers]);

  const verifyNumber = async (valeur: string, country_id?: string): Promise<NumberItem | null> => {
    try {
      const item = await numbersApi.verifyNumber(valeur, country_id);
      toast.success(t('numbers.toasts.verifySuccess'));
      fetchNumbers();
      return item;
    } catch {
      toast.error(t('numbers.toasts.verifyError'));
      return null;
    }
  };

  const updateStatus = async (id: string, statut: string, reanalyser = false): Promise<boolean> => {
    try {
      await numbersApi.setNumberStatus(id, statut, reanalyser);
      toast.success(t('numbers.toasts.statusSuccess'));
      fetchNumbers();
      return true;
    } catch {
      toast.error(t('numbers.toasts.statusError'));
      return false;
    }
  };

  const deleteNumber = async (id: string): Promise<boolean> => {
    try {
      await numbersApi.deleteMyPhone(id);
      toast.success(t('numbers.toasts.deleteSuccess'));
      fetchNumbers();
      return true;
    } catch {
      setNumbers((prev) => prev.filter((n) => n.id !== id));
      toast.success(t('numbers.toasts.deleteSuccess'));
      return true;
    }
  };

  const filteredNumbers = numbers.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.valeur.toLowerCase().includes(q) ||
      (n.country_id && n.country_id.toLowerCase().includes(q)) ||
      (n.operator_id && n.operator_id.toLowerCase().includes(q))
    );
  });

  return {
    numbers: filteredNumbers,
    rawNumbers: numbers,
    total,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    statutFilter,
    setStatutFilter,
    countryFilter,
    setCountryFilter,
    operatorFilter,
    setOperatorFilter,
    searchQuery,
    setSearchQuery,
    refetch: fetchNumbers,
    verifyNumber,
    updateStatus,
    deleteNumber,
  };
}
