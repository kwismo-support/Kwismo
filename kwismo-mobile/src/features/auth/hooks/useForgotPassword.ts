// Hook personnalisé pour la réinitialisation et l'oubli de mot de passe
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/auth.api';
import { toast } from '../../../shared/store/toastStore';

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleForgotPassword = async (email: string) => {
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      if (res.success) {
        toast.success(t('toasts.otpSent', 'Instructions envoyées par email.'));
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message };
    } finally {
      setLoading(false);
    }
  };

  return { handleForgotPassword, loading };
}

export function useResetPassword() {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleResetPassword = async (token: string, newPassword: string) => {
    setLoading(true);
    try {
      const res = await authApi.resetPassword(token, newPassword);
      if (res.success) {
        toast.success(t('toasts.passwordResetSuccess', 'Mot de passe réinitialisé !'));
        return { success: true };
      }
      return { success: false, message: res.message };
    } finally {
      setLoading(false);
    }
  };

  return { handleResetPassword, loading };
}
