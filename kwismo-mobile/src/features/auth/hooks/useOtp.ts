// Hook personnalisé pour gérer la vérification et le renvoi d'OTP
import { useState, useEffect } from 'react';
import { authApi } from '../services/auth.api';

export function useOtp(initialPhoneOrEmail: string = '') {
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

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

  const verifyOtp = async (code: string, target?: string) => {
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({
        phoneOrEmail: target || initialPhoneOrEmail,
        code,
      });
      return res;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (target?: string) => {
    if (!canResend) return;
    setLoading(true);
    try {
      const res = await authApi.resendOtp(target || initialPhoneOrEmail);
      if (res.success) {
        setResendTimer(60);
        setCanResend(false);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { verifyOtp, resendOtp, loading, resendTimer, canResend };
}
