export interface SenderNumberOption {
  id: string;
  label: string;
  phone: string;
  callingCode: string;
  operator: 'Orange' | 'MTN';
}

export interface ActionOption {
  id: string;
  label: string;
  description: string;
  ussdFormat: string;
}

export const MOCK_REGISTERED_SENDERS: SenderNumberOption[] = [
  {
    id: 'sim1',
    label: 'SIM 1 (Orange Money)',
    phone: '6 98 44 43 88',
    callingCode: '+237',
    operator: 'Orange',
  },
  {
    id: 'sim2',
    label: 'SIM 2 (MTN MoMo)',
    phone: '6 70 12 34 56',
    callingCode: '+237',
    operator: 'MTN',
  },
];

export const MOCK_AVAILABLE_ACTIONS: ActionOption[] = [
  {
    id: 'transfer_momo',
    label: "Transfert d'argent Mobile Money",
    description: 'Envoi direct vers un compte Mobile Money / Orange Money',
    ussdFormat: '#150*1*1*{dest}*{amount}#',
  },
  {
    id: 'merchant_pay',
    label: 'Paiement Marchand USSD',
    description: 'Règlement chez un marchand partenaire Kwismo',
    ussdFormat: '#150*3*{dest}*{amount}#',
  },
];
