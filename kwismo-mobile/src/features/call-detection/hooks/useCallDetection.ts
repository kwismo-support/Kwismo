// Hook React pour gérer l'état et l'activation de la détection d'appels malveillants
import { useState } from 'react';
import { callApi, CallDetectionResult } from '../services/call.api';

export function useCallDetection() {
  const [enabled, setEnabled] = useState(true);
  const [currentCallResult, setCurrentCallResult] = useState<CallDetectionResult | null>(null);

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

  return { enabled, setEnabled, checkCall, currentCallResult };
}
