export interface UserSimNumber {
  id: string;
  countryCode: string;
  callingCode: string;
  phone: string;
  operator: 'Orange' | 'MTN' | 'Camtel' | 'Autre';
  status: 'verified' | 'pending' | 'compromised';
  addedDate: string;
}

export const MOCK_SIM_NUMBERS: UserSimNumber[] = [
  {
    id: 'num-1',
    countryCode: 'CM',
    callingCode: '+237',
    phone: '6 98 44 43 88',
    operator: 'Orange',
    status: 'verified',
    addedDate: '12 Août',
  },
  {
    id: 'num-2',
    countryCode: 'CM',
    callingCode: '+237',
    phone: '6 77 12 34 56',
    operator: 'MTN',
    status: 'pending',
    addedDate: '28 Août',
  },
];
