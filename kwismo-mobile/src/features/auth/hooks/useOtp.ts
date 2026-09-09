// Hook personnalisé pour gérer la vérification et le renvoi d'OTP avec FastAPI backend
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/auth.api';
import { useAuthStore } from '../../../shared/store/authStore';
import { toast } from '../../../shared/store/toastStore';

export function useOtp(initialEmail: string = '') {
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { login } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const verifyOtp = async (code: string, emailTarget?: string) => {
    setLoading(true);
    try {
      const email = (emailTarget || initialEmail).trim();
      const res = await authApi.verifyEmail({ email, code: code.trim() });
      if (res.success && res.data) {
        const data = res.data;
        const userPayload = {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.prenom,
          lastName: data.user.nom,
          role: data.user.role,
        };
        await login(userPayload, data.access_token, data.refresh_token);
        toast.success(t('toasts.otpSent', 'Code validé avec succès !'));
        return { success: true, data };
      }
      return { success: false, message: res.message };
    } catch (err: any) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (emailTarget?: string) => {
    if (!canResend) return;
    setLoading(true);
    try {
      const email = (emailTarget || initialEmail).trim();
      const res = await authApi.resendEmailOtp(email);
      if (res.success) {
        setResendTimer(60);
        setCanResend(false);
        toast.success(t('toasts.otpResent', 'Nouveau code envoyé.'));
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { verifyOtp, resendOtp, loading, resendTimer, canResend };
}

