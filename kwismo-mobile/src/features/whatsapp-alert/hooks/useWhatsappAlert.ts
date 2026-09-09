// Hook React pour piloter l'alerte de piratage WhatsApp via le backend Kwismo
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { whatsappApi, DeclareIncidentPayload, BroadcastPayload } from '../services/whatsapp.api';
import { toast } from '../../../shared/store/toastStore';

export function useWhatsappAlert() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const declareIncident = async (payload: DeclareIncidentPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await whatsappApi.declareIncident(payload);
      if (res.success && res.data) {
        toast.success(t('whatsapp.settingsSaved', 'Incident WhatsApp enregistré !'));
        return { success: true, data: res.data };
      } else {
        const msg = res.message || t('errors.generalMessage', 'Erreur de déclaration.');
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

  const broadcastAlert = async (payload: BroadcastPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await whatsappApi.broadcastAlert(payload);
      if (res.success && res.data) {
        toast.success(t('toasts.generalSuccess', 'Alerte diffusée avec succès !'));
        return { success: true, data: res.data };
      } else {
        const msg = res.message || t('errors.generalMessage', 'Erreur de diffusion.');
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

  return { declareIncident, broadcastAlert, loading, error };
}
