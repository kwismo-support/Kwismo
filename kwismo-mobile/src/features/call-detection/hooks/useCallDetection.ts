// Hook React pour la détection des appels entrants inconnus et notifications post-appel (§9.6)
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { callApi, CallDetectionResult } from '../services/call.api';
import { toast } from '../../../shared/store/toastStore';

export function useCallDetection() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);
  const [currentCallResult, setCurrentCallResult] = useState<CallDetectionResult | null>(null);
  const [postCallNotificationNumber, setPostCallNotificationNumber] = useState<string | null>(null);

  const checkCall = async (incomingNumber: string) => {
    if (!enabled) return null;
    const res = await callApi.evaluateIncomingCall({
      incomingNumber,
      timestamp: new Date().toISOString(),
    });
    if (res.success && res.data) {
      setCurrentCallResult(res.data);
    }
    return res;
  };

  const handleCallEnded = (phone: string, isSuspect: boolean = true) => {
    setPostCallNotificationNumber(phone);
    if (isSuspect) {
      toast.info(
        `Appel entrant terminé avec ${phone}. Appuyez pour signaler ce numéro.`,
        () => router.push({ pathname: '/(app)/report', params: { phone } })
      );
    }
  };

  return {
    enabled,
    setEnabled,
    checkCall,
    currentCallResult,
    handleCallEnded,
    postCallNotificationNumber,
  };
}
