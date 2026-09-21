import * as Contacts from 'expo-contacts/legacy';
import { parsePhoneNumberFromString } from 'libphonenumber-js/min';
import { ApiClient } from '../../../shared/services/apiClient';
import { ContactItem } from '../types/contacts.types';

export const contactsService = {
  async requestPermissionAndFetch(): Promise<{
    granted: boolean;
    contacts: ContactItem[];
  }> {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        return { granted: false, contacts: [] };
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
      });

      let backendPhonesSet = new Set<string>();
      let compromisedPhonesSet = new Set<string>();
      let verifiedPhonesSet = new Set<string>();

      try {
        const res = await ApiClient.request<
          Array<{ id: string; valeur: string; est_verifie: boolean; est_compromis: boolean }>
        >('/users/me/phones', { method: 'GET', silent: true });
        if (res.success && res.data) {
          res.data.forEach((p) => {
            const clean = p.valeur.replace(/\s+/g, '');
            backendPhonesSet.add(clean);
            if (p.est_compromis) compromisedPhonesSet.add(clean);
            if (p.est_verifie) verifiedPhonesSet.add(clean);
          });
        }
      } catch (err) {}

      const deviceContacts: ContactItem[] = data
        .filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0)
        .map((c, idx) => {
          const rawPhone = c.phoneNumbers![0].number || '';
          const nameParts = [(c as any).firstName, (c as any).middleName, (c as any).lastName].filter(Boolean).join(' ');
          const displayName = c.name || (nameParts.length > 0 ? nameParts : ((c as any).company || (c as any).nickname || rawPhone));
          const parsed = parsePhoneNumberFromString(rawPhone, 'CM');

          const formattedPhone = parsed ? parsed.formatInternational() : rawPhone;
          const cleanVal = parsed ? parsed.number : rawPhone.replace(/\s+/g, '');
          const countryCode = parsed?.country || 'CM';

          const hasKwismo = backendPhonesSet.has(cleanVal);
          let kwismoStatus: ContactItem['kwismoStatus'] = 'none';

          if (hasKwismo) {
            if (compromisedPhonesSet.has(cleanVal)) {
              kwismoStatus = 'compromised';
            } else if (verifiedPhonesSet.has(cleanVal)) {
              kwismoStatus = 'secured';
            } else {
              kwismoStatus = 'pending';
            }
          }

          return {
            id: c.id || `contact-${idx}`,
            name: displayName,
            phone: formattedPhone,
            hasKwismo,
            kwismoStatus,
            countryCode,
          };
        });

      return { granted: true, contacts: deviceContacts };
    } catch (e) {
      return { granted: false, contacts: [] };
    }
  },
};
