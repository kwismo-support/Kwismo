import { useState, useEffect, useCallback } from 'react';
import { userApi, type UserPhone } from '../services/user.api';

export function useUserPortal() {
  const [phones, setPhones] = useState<UserPhone[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'verify' | 'report' | 'numbers' | 'profile'>('home');
  const [selectedPhone, setSelectedPhone] = useState<UserPhone | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isCompromiseModalOpen, setIsCompromiseModalOpen] = useState(false);

  const fetchPhones = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userApi.getMyPhones();
      setPhones(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhones();
  }, [fetchPhones]);

  const addPhone = async (valeur: string) => {
    setLoading(true);
    try {
      const created = await userApi.addMyPhone(valeur);
      setIsAddModalOpen(false);
      await fetchPhones();
      setSelectedPhone(created);
      setIsVerifyModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const verifyPhone = async (code: string) => {
    if (!selectedPhone) return;
    setLoading(true);
    try {
      await userApi.verifyMyPhone(selectedPhone.id, code);
      setIsVerifyModalOpen(false);
      setSelectedPhone(null);
      await fetchPhones();
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!selectedPhone) return;
    await userApi.resendMyPhoneOtp(selectedPhone.id);
  };

  const removePhone = async (phoneId: string) => {
    setLoading(true);
    try {
      await userApi.removeMyPhone(phoneId);
      await fetchPhones();
    } finally {
      setLoading(false);
    }
  };

  const declareCompromise = async (typeIncident: string, description: string) => {
    if (!selectedPhone) return;
    setLoading(true);
    try {
      await userApi.compromiseMyPhone(selectedPhone.id, typeIncident, description);
      setIsCompromiseModalOpen(false);
      setSelectedPhone(null);
      await fetchPhones();
    } finally {
      setLoading(false);
    }
  };

  return {
    phones,
    loading,
    activeTab,
    setActiveTab,
    selectedPhone,
    setSelectedPhone,
    isAddModalOpen,
    setIsAddModalOpen,
    isVerifyModalOpen,
    setIsVerifyModalOpen,
    isCompromiseModalOpen,
    setIsCompromiseModalOpen,
    fetchPhones,
    addPhone,
    verifyPhone,
    resendOtp,
    removePhone,
    declareCompromise,
  };
}
