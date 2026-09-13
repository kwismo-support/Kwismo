// Hook personnalisé React pour gérer l'inscription d'un nouvel utilisateur
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/auth.api';
import { RegisterPayload } from '../schemas/auth.schema';
import { toast } from '../../../shared/store/toastStore';

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleRegister = async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.register(payload);
      if (res.success) {
        toast.success(t('toasts.registerSuccess', 'Compte créé avec succès !'));
        return { success: true, message: res.message };
      } else {
        const msg = res.message || t('errors.generalMessage', "Erreur lors de l'inscription.");
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

  return { handleRegister, loading, error };
}
