import { useState, useEffect, useCallback } from 'react';
import { parsePhoneNumberFromString } from 'libphonenumber-js/min';
import { managementApi } from '../services/management.api';
import { UserPhoneBackend, UserSimNumber, PhoneStatus } from '../types/management.types';
import { storage } from '../../../shared/services/storage';

const USER_PHONES_CACHE_KEY = 'kwismo_user_phones_cache';

export function detectOperator(cleanPhone: string): string {
  const raw = cleanPhone.replace(/\s+/g, '').replace(/^\+237/, '');
  if (
    raw.startsWith('69') ||
    raw.startsWith('655') ||
    raw.startsWith('656') ||
    raw.startsWith('657')
  ) {
    return 'Orange';
  }
  if (
    raw.startsWith('67') ||
    raw.startsWith('68') ||
    raw.startsWith('650') ||
    raw.startsWith('651') ||
    raw.startsWith('652')
  ) {
    return 'MTN';
  }
  if (raw.startsWith('62') || raw.startsWith('242')) {
    return 'Camtel';
  }
  return 'Autre';
}

export function transformBackendPhone(item: UserPhoneBackend): UserSimNumber {
  const parsed = parsePhoneNumberFromString(item.valeur);
  const countryCode = parsed ? (parsed.country || 'CM') : 'CM';
  const callingCode = parsed ? `+${parsed.countryCallingCode}` : '+237';
  const nationalNumber = parsed ? parsed.formatNational() : item.valeur;

  let status: PhoneStatus = 'pending';
  if (item.est_compromis) {
    status = 'compromised';
  } else if (item.est_verifie) {
    status = 'verified';
  }

  const addedDate = item.created_at
    ? new Date(item.created_at).toLocaleDateString()
    : undefined;

  return {
    id: item.id,
    phone: nationalNumber,
    countryCode,
    callingCode,
    operator: detectOperator(item.valeur),
    status,
    addedDate,
    rawValeur: item.valeur,
  };
}

export function useManagement() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numbers, setNumbers] = useState<UserSimNumber[]>([]);

  const fetchNumbers = useCallback(async (isManualRefresh = false) => {
    setError(null);
    try {
      const res = await managementApi.listMyPhones();
      if (res.success && res.data) {
        const transformed = res.data.map(transformBackendPhone);
        setNumbers(transformed);
        await storage.setItem(USER_PHONES_CACHE_KEY, JSON.stringify(transformed)).catch(() => {});
      } else if (isManualRefresh) {
        setError(res.message || 'Failed to fetch numbers');
      }
    } catch (err: any) {
      if (isManualRefresh) setError(err.message || 'Network error');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      // 1. Instant local cache load (0ms)
      const cachedStr = await storage.getItem(USER_PHONES_CACHE_KEY);
      let hasValidCache = false;
      if (cachedStr && isMounted) {
        try {
          const parsed = JSON.parse(cachedStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNumbers(parsed);
            setLoading(false);
            hasValidCache = true;
          }
        } catch {}
      }

      // 2. Only fetch from network if NO cached numbers exist in storage
      if (!hasValidCache) {
        await fetchNumbers(false);
      }
      if (isMounted) setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [fetchNumbers]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNumbers(true);
    setRefreshing(false);
  }, [fetchNumbers]);

  const saveUpdatedNumbers = (updated: UserSimNumber[]) => {
    setNumbers(updated);
    storage.setItem(USER_PHONES_CACHE_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const addNumber = async (valeur: string) => {
    const res = await managementApi.addPhone(valeur);
    if (res.success && res.data) {
      const transformed = transformBackendPhone(res.data);
      const updated = [...numbers.filter((n) => n.id !== transformed.id), transformed];
      saveUpdatedNumbers(updated);
      return { success: true, data: transformed };
    }
    return { success: false, message: res.message };
  };

  const verifyOtp = async (phoneId: string, code: string) => {
    const res = await managementApi.verifyPhoneOtp(phoneId, code);
    if (res.success) {
      const updated = numbers.map((n) => (n.id === phoneId ? { ...n, status: 'verified' as PhoneStatus } : n));
      saveUpdatedNumbers(updated);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message };
  };

  const resendOtp = async (phoneId: string) => {
    return await managementApi.resendPhoneOtp(phoneId);
  };

  const deleteNumber = async (phoneId: string) => {
    const res = await managementApi.removePhone(phoneId);
    if (res.success) {
      const updated = numbers.filter((n) => n.id !== phoneId);
      saveUpdatedNumbers(updated);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message };
  };

  const declareCompromised = async (phoneId: string) => {
    const res = await managementApi.declarePhoneCompromised(phoneId);
    if (res.success) {
      const updated = numbers.map((n) => (n.id === phoneId ? { ...n, status: 'compromised' as PhoneStatus } : n));
      saveUpdatedNumbers(updated);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message };
  };

  return {
    loading,
    refreshing,
    error,
    numbers,
    fetchNumbers,
    refresh,
    addNumber,
    verifyOtp,
    resendOtp,
    deleteNumber,
    declareCompromised,
  };
}
