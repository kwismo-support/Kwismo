import { useState, useEffect, useCallback } from 'react';
import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js/min';
import { contactsService } from '../services/contacts.service';
import { ContactItem, AddContactPayload } from '../types/contacts.types';

export function useContacts() {
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [contactsList, setContactsList] = useState<ContactItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [isInviteMode, setIsInviteMode] = useState(false);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    const result = await contactsService.requestPermissionAndFetch();
    setPermissionGranted(result.granted);
    setContactsList(result.contacts);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const addContactLocally = (payload: AddContactPayload): { success: boolean; messageKey?: string; item?: ContactItem } => {
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

    setContactsList((prev) => [newContact, ...prev]);
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
    loadContacts,
    addContactLocally,
    toggleSelectAll,
    toggleSelectContact,
  };
}
