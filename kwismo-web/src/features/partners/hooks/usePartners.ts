import { useState, useEffect, useCallback } from 'react';
import { partnersApi, type PartnerItem, type AffiliationRule } from '../services/partners.api';
import { toast } from '@/shared/store/toastStore';
import { useTranslation } from 'react-i18next';

export function usePartners() {
  const { t } = useTranslation('admin');
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await partnersApi.getPartners(page, pageSize);
      setPartners(res.items);
      setTotal(res.total);
    } catch {
      toast.error(t('partners.toasts.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, t]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const createPartner = async (payload: { nom_entreprise: string; type_partenariat: string }): Promise<PartnerItem | null> => {
    try {
      const created = await partnersApi.createPartner(payload);
      toast.success(t('partners.toasts.createSuccess'));
      fetchPartners();
      return created;
    } catch {
      toast.error(t('partners.toasts.createError'));
      return null;
    }
  };

  const addRule = async (partnerId: string, country_id: string, prefixes: string[]): Promise<AffiliationRule | null> => {
    try {
      const rule = await partnersApi.addAffiliationRule(partnerId, { country_id, prefixes });
      toast.success(t('partners.toasts.ruleAddSuccess'));
      return rule;
    } catch {
      toast.error(t('partners.toasts.ruleAddError'));
      return null;
    }
  };

  const deletePartner = async (id: string): Promise<boolean> => {
    try {
      setPartners((prev) => prev.filter((p) => p.id !== id));
      toast.success(t('partners.toasts.deleteSuccess'));
      return true;
    } catch {
      toast.error(t('partners.toasts.deleteError'));
      return false;
    }
  };

  const filteredPartners = partners.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.nom_entreprise.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type_partenariat.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      typeFilter === 'ALL' || p.type_partenariat.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesType;
  });

  return {
    partners: filteredPartners,
    rawPartners: partners,
    total,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    typeFilter,
    setTypeFilter,
    searchQuery,
    setSearchQuery,
    refetch: fetchPartners,
    createPartner,
    addRule,
    deletePartner,
  };
}
