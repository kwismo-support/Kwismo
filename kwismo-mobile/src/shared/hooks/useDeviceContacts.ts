import { useState, useEffect, useCallback } from 'react';
import * as Contacts from 'expo-contacts/legacy';
import { formatPhoneNumber } from '../utils/phoneFormatter';

export interface ContactItemInfo {
  name: string;
  initials: string;
  bg: string;
}

export function useDeviceContacts() {
  const [contactMap, setContactMap] = useState<Record<string, ContactItemInfo>>({});

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
          const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.PhoneNumbers],
          });
          if (data && data.length > 0) {
            const map: Record<string, ContactItemInfo> = {};
            const bgColors = ['#25B46E', '#F97316', '#3B82F6', '#6366F1'];
            data.forEach((c, idx) => {
              if (c.phoneNumbers && c.phoneNumbers.length > 0) {
                const nameParts = [(c as any).firstName, (c as any).middleName, (c as any).lastName].filter(Boolean).join(' ');
                const displayName = c.name || (nameParts.length > 0 ? nameParts : ((c as any).company || (c as any).nickname));
                if (displayName) {
                  let initials = '';
                  const parts = displayName.trim().split(' ');
                  initials = parts[0][0];
                  if (parts.length > 1) initials += parts[1][0];
                  initials = initials.toUpperCase();
                  const bg = bgColors[idx % bgColors.length];

                  c.phoneNumbers.forEach((p) => {
                    if (p.number) {
                      const clean = p.number.replace(/\D/g, '');
                      if (clean) {
                        map[clean] = { name: displayName, initials, bg };
                        if (clean.length >= 8) {
                          map[clean.slice(-8)] = { name: displayName, initials, bg };
                          map[clean.slice(-9)] = { name: displayName, initials, bg };
                        }
                      }
                    }
                  });
                }
              }
            });
            setContactMap(map);
          }
        }
      } catch {}
    })();
  }, []);

  const getContactDisplay = useCallback(
    (phone?: string) => {
      if (!phone) return { displayName: '', initials: undefined, bg: undefined, isContact: false };
      const clean = phone.replace(/\D/g, '');
      const matched =
        contactMap[clean] ||
        (clean.length >= 8 ? contactMap[clean.slice(-8)] || contactMap[clean.slice(-9)] : null);

      if (matched) {
        return {
          displayName: matched.name,
          initials: matched.initials,
          bg: matched.bg,
          isContact: true,
        };
      }

      return {
        displayName: formatPhoneNumber(phone),
        initials: undefined,
        bg: undefined,
        isContact: false,
      };
    },
    [contactMap]
  );

  return { contactMap, getContactDisplay };
}
