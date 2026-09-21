import { useState, useEffect, useCallback } from 'react';
import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js/min';
import { contactsService } from '../services/contacts.service';
import { contactsApi } from '../services/contacts.api';
import { ContactItem, AddContactPayload } from '../types/contacts.types';
import { storage } from '../../../shared/services/storage';

const CONTACTS_CACHE_KEY = 'kwismo_contacts_cache';

export function useContacts() {
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [contactsList, setContactsList] = useState<ContactItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [isInviteMode, setIsInviteMode] = useState(false);

  const loadContacts = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setLoading(true);
    try {
      // 1. Load phone device contacts
      const deviceResult = await contactsService.requestPermissionAndFetch();
      setPermissionGranted(deviceResult.granted);
      const localDeviceContacts = deviceResult.contacts || [];

      // 2. Prepare payload for online merging (POST /contacts/sync)
      const syncPayload = localDeviceContacts.map((c) => ({
        nom: c.name || c.phone,
        numero: c.phone,
      }));

      // 3. Perform silent online sync with DB
      if (syncPayload.length > 0) {
        const syncRes = await contactsApi.syncContacts(syncPayload);
        if (syncRes.success && Array.isArray(syncRes.data)) {
          const onlineItems = syncRes.data.map((c: any) => ({
            id: c.id,
            name: c.nom || c.numero,
            phone: c.numero,
            hasKwismo: c.statut === 'securise',
            kwismoStatus: c.statut || 'none',
            countryCode: 'CM',
          }));

          // Merge local device contacts + online DB contacts without duplicates
          const phoneMap = new Map<string, ContactItem>();
          localDeviceContacts.forEach((item) => phoneMap.set(item.phone.replace(/\s+/g, ''), item));
          onlineItems.forEach((item) => phoneMap.set(item.phone.replace(/\s+/g, ''), item));

          const merged = Array.from(phoneMap.values());
          setContactsList(merged);
          await storage.setItem(CONTACTS_CACHE_KEY, JSON.stringify(merged)).catch(() => {});
          return;
        }
      }

      setContactsList(localDeviceContacts);
      await storage.setItem(CONTACTS_CACHE_KEY, JSON.stringify(localDeviceContacts)).catch(() => {});
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      // Instant 0ms load from local cache
      const cachedStr = await storage.getItem(CONTACTS_CACHE_KEY);
      if (cachedStr && isMounted) {
        try {
          const parsed = JSON.parse(cachedStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setContactsList(parsed);
            setLoading(false);
          }
        } catch {}
      }

      // Background sync with device + online DB
      await loadContacts(false);
      if (isMounted) setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [loadContacts]);

  const addContactLocally = async (payload: AddContactPayload): Promise<{ success: boolean; messageKey?: string; item?: ContactItem }> => {
    const fullNumber = `${payload.callingCode}${payload.phone.replace(/\s+/g, '')}`;
    const isValid = isValidPhoneNumber(fullNumber, payload.countryCode as any);

    if (!isValid) {
      return { success: false, messageKey: 'common.invalidPhoneNumber' };
    }

    const parsed = parsePhoneNumberFromString(fullNumber, payload.countryCode as any);
    const formattedPhone = parsed ? parsed.formatInternational() : fullNumber;
    const fullName = `${payload.prenom} ${payload.nom}`.trim() || formattedPhone;

    const newContact: ContactItem = {
      id: `local-${Date.now()}`,
      name: fullName,
      phone: formattedPhone,
      hasKwismo: false,
      kwismoStatus: 'none',
      countryCode: payload.countryCode,
    };

    setContactsList((prev) => {
      const updated = [newContact, ...prev];
      storage.setItem(CONTACTS_CACHE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    // Also send online to backend DB
    contactsApi.addContact({ nom: fullName, numero: formattedPhone }).catch(() => {});

    return { success: true, item: newContact };
  };

  const toggleSelectAll = (filtered: ContactItem[]) => {
    const allSelected = filtered.length > 0 && filtered.every((c) => selectedContactIds.has(c.id));
    if (allSelected) {
      setSelectedContactIds(new Set());
    } else {
      const newSet = new Set<string>();
      filtered.forEach((c) => newSet.add(c.id));
      setSelectedContactIds(newSet);
    }
  };

  const toggleSelectContact = (id: string) => {
    const newSet = new Set(selectedContactIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedContactIds(newSet);
  };

  const currentDisplayContacts = isInviteMode
    ? contactsList.filter((c) => !c.hasKwismo)
    : contactsList;

  const filteredContacts = currentDisplayContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
  );

  return {
    loading,
    permissionGranted,
    contactsList,
    filteredContacts,
    search,
    setSearch,
    selectedContactIds,
    isInviteMode,
    setIsInviteMode,
    loadContacts: () => loadContacts(true),
    addContactLocally,
    toggleSelectAll,
    toggleSelectContact,
  };
}
