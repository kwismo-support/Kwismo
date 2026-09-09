import { useState, useCallback } from 'react';
import { callDetectionApi, CallLogItem } from '../services/callDetection.api';

export function useCallDetection() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [activeIncomingCall, setActiveIncomingCall] = useState<CallLogItem | null>(null);
  const [callHistory, setCallHistory] = useState<CallLogItem[]>([
    {
      id: 'log-1',
      phone_number: '+237690000999',
      caller_name: 'Usurpation Orange Money',
      risk_score: 0.92,
      statut: 'frauduleux',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      is_scam: true,
    },
    {
      id: 'log-2',
      phone_number: '+237651222333',
      caller_name: 'Numéro Inconnu',
      risk_score: 0.15,
      statut: 'securise',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      is_scam: false,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const toggleProtection = useCallback(() => {
    setIsEnabled((prev) => !prev);
  }, []);

  const simulateIncomingCall = useCallback(async (phoneNumber: string = '+237699998888') => {
    setLoading(true);
    try {
      const result = await callDetectionApi.evaluateIncomingCall(phoneNumber);
      setActiveIncomingCall(result);
      setCallHistory((prev) => [result, ...prev]);
    } finally {
      setLoading(false);
    }
  }, []);

  const dismissCallWarning = useCallback(() => {
    setActiveIncomingCall(null);
  }, []);

  return {
    isEnabled,
    toggleProtection,
    activeIncomingCall,
    simulateIncomingCall,
    dismissCallWarning,
    callHistory,
    loading,
  };
}
