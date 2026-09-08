// Hook React pour piloter le flux de transfert d'argent (saisie, USSD, confirmation)
import { useState } from 'react';
import { transferApi, PrepareTransferPayload, PrepareTransferResponse } from '../services/transfer.api';
import { launchUssd } from '../lib/ussd';

export function useTransfer() {
  const [loading, setLoading] = useState(false);
  const [preparedData, setPreparedData] = useState<PrepareTransferResponse | null>(null);

  const initTransfer = async (payload: PrepareTransferPayload) => {
    setLoading(true);
    try {
      const res = await transferApi.prepareTransfer(payload);
      if (res.success && res.data) {
        setPreparedData(res.data);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const executeUssdCall = async () => {
    if (!preparedData?.ussdCode) return;
    await launchUssd(preparedData.ussdCode);
  };

  const confirmCompletion = async () => {
    if (!preparedData?.transactionId) return;
    setLoading(true);
    try {
      return await transferApi.confirmTransfer(preparedData.transactionId);
    } finally {
      setLoading(false);
    }
  };

  return { initTransfer, executeUssdCall, confirmCompletion, preparedData, loading };
}
