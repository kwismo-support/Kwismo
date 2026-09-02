import { Platform } from 'react-native';

export interface RawContact {
  id: string;
  name: string;
  phone: string;
}

export const getDeviceContacts = async (): Promise<{
  granted: boolean;
  contacts: RawContact[];
}> => {
  if (Platform.OS === 'web') {
    // Contacts de prévisualisation sur le Web (l'API de contacts native n'existant pas sur navigateur desktop)
    const mockContacts: RawContact[] = [
      { id: '1', name: 'Alain Dupont', phone: '+237 6 98 44 43 88' },
      { id: '2', name: 'Carine Mbida', phone: '+237 6 77 12 34 56' },
      { id: '3', name: 'Boris Talla', phone: '+237 6 55 98 76 54' },
      { id: '4', name: 'Diane Ewane', phone: '+33 6 12 34 56 78' },
      { id: '5', name: 'Eric Kamga', phone: '+237 6 70 88 99 00' },
      { id: '6', name: 'Fanny Ngo', phone: '+237 6 99 11 22 33' },
      { id: '7', name: 'Gilles Mbia', phone: '+237 6 75 44 33 22' },
    ];
    return { granted: true, contacts: mockContacts };
  }

  try {
    const Contacts = require('expo-contacts');
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      return { granted: false, contacts: [] };
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
    });

    const results: RawContact[] = [];
    if (data && data.length > 0) {
      data.forEach((c: any) => {
        if (c.phoneNumbers && c.phoneNumbers.length > 0) {
          c.phoneNumbers.forEach((p: any, idx: number) => {
            if (p.number) {
              results.push({
                id: `${c.id || Math.random()}-${idx}`,
                name: c.name || 'Contact',
                phone: p.number,
              });
            }
          });
        }
      });
    }

    return { granted: true, contacts: results };
  } catch {
    return { granted: false, contacts: [] };
  }
};
