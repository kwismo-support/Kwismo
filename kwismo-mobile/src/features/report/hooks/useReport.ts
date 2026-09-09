// Hook React pour gérer les signalements de numéros suspects
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { reportApi, ReportPayload } from '../services/report.api';
import { toast } from '../../../shared/store/toastStore';

export function useReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const submitReport = async (payload: ReportPayload) => {
    if (!payload.numero.trim()) {
      const msg = t('report.selectPhoneError', 'Veuillez saisir un numéro.');
      setError(msg);
      toast.error(msg);
      return { success: false };
    }
    if (!payload.motif.trim()) {
      const msg = t('report.selectReasonError', 'Veuillez sélectionner un motif.');
      setError(msg);
      toast.error(msg);
      return { success: false };
    }

    setLoading(true);
    setError(null);
    try {
      const res = await reportApi.submitReport(payload);
      if (res.success) {
        toast.success(t('report.reportSuccessTitle', 'Signalement transmis avec succès !'));
        return { success: true, data: res.data };
      } else {
        const msg = res.message || t('errors.generalMessage', 'Échec du signalement.');
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

  return { submitReport, loading, error };
}
