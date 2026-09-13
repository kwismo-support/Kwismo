// Hook React pour piloter le flux de transfert d'argent sécurisé via USSD et FastAPI
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { transferApi, PrepareTransactionPayload, TransactionOut, UssdOperator, UssdAction } from '../services/transfer.api';
import { launchUssd } from '../lib/ussd';
import { toast } from '../../../shared/store/toastStore';

export function useTransfer() {
  const [loading, setLoading] = useState(false);
  const [operators, setOperators] = useState<UssdOperator[]>([]);
  const [actions, setActions] = useState<UssdAction[]>([]);
  const [preparedData, setPreparedData] = useState<TransactionOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const loadMetaData = useCallback(async () => {
    try {
      const opsRes = await transferApi.getOperators();
      if (opsRes.success && opsRes.data) {
        setOperators(opsRes.data);
      }
      const actRes = await transferApi.getActions();
      if (actRes.success && actRes.data) {
        setActions(actRes.data);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadMetaData();
  }, [loadMetaData]);

  const initTransfer = async (payload: PrepareTransactionPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await transferApi.prepareTransfer(payload);
      if (res.success && res.data) {
        setPreparedData(res.data);
        toast.success(t('toasts.transferInitiated', 'Transfert préparé avec succès !'));
        return { success: true, data: res.data };
      } else {
        const msg = res.message || t('errors.generalMessage', 'Échec du transfert.');
        setError(msg);
        return { success: false, message: msg };
      }
    } catch (err: any) {
      const msg = err.message || t('toasts.networkError', 'Erreur réseau.');
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const executeUssdCall = async () => {
    if (!preparedData?.code_ussd_genere) return;
    await launchUssd(preparedData.code_ussd_genere);
    toast.success(t('toasts.ussdLaunched', 'Code USSD envoyé au téléphone.'));
  };

  return {
    initTransfer,
    executeUssdCall,
    preparedData,
    operators,
    actions,
    loading,
    error,
  };
}

