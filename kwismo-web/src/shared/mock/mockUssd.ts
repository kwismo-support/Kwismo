export interface UssdAction {
  id: number | string;
  label: string;
  code: string;
}

export interface OperatorDTO {
  id: number | string;
  nom: string;
  countryId?: string;
  countryName?: string;
  prefixes: string[];
  ussd: UssdAction[];
}

export interface CountryDTO {
  id: number | string;
  pays: string;
  nom?: string;
  code: string;
  indicatif: string;
  codePays?: string;
  isDefault: boolean;
  estParDefaut?: boolean;
  operateurs: OperatorDTO[];
}

export interface UssdActionDTO {
  id: string;
  operatorId: string;
  operatorName: string;
  nomAction: string;
  codeUSSD: string;
  format: string;
}

export const MOCK_COUNTRIES: CountryDTO[] = [
  {
    id: 1, pays: 'Cameroun', nom: 'Cameroun', code: 'CM', indicatif: '+237', codePays: '+237', isDefault: true, estParDefaut: true,
    operateurs: [
      {
        id: 11, nom: 'MTN Cameroun', prefixes: ['67', '68', '650-654'],
        ussd: [
          { id: 111, label: 'Transfert', code: '*126*{numero}*{montant}#' },
          { id: 112, label: 'Retrait', code: '*127*{numero}*{montant}#' },
          { id: 113, label: 'Consultation de solde', code: '*126#' },
        ],
      },
      {
        id: 12, nom: 'Orange Cameroun', prefixes: ['655-659', '69'],
        ussd: [
          { id: 121, label: 'Transfert', code: '*150*{numero}*{montant}#' },
          { id: 122, label: 'Retrait', code: '*151*{numero}*{montant}#' },
        ],
      },
      {
        id: 13, nom: 'Camtel', prefixes: ['620-624'],
        ussd: [{ id: 131, label: 'Transfert', code: '*400*{numero}*{montant}#' }],
      },
    ],
  },
  {
    id: 2, pays: "Côte d'Ivoire", nom: "Côte d'Ivoire", code: 'CI', indicatif: '+225', codePays: '+225', isDefault: false, estParDefaut: false,
    operateurs: [
      {
        id: 21, nom: 'Orange CI', prefixes: ['07', '08', '09'],
        ussd: [
          { id: 211, label: 'Transfert', code: '*144*{numero}*{montant}#' },
          { id: 212, label: 'Retrait', code: '*144*2*{numero}*{montant}#' },
        ],
      },
      {
        id: 22, nom: 'Moov Africa CI', prefixes: ['01', '02', '03'],
        ussd: [{ id: 221, label: 'Transfert', code: '*155*{numero}*{montant}#' }],
      },
    ],
  },
  {
    id: 3, pays: 'Sénégal', nom: 'Sénégal', code: 'SN', indicatif: '+221', codePays: '+221', isDefault: false, estParDefaut: false,
    operateurs: [
      {
        id: 31, nom: 'Orange Sénégal', prefixes: ['77', '78'],
        ussd: [{ id: 311, label: 'Transfert', code: '*144*{numero}*{montant}#' }],
      },
      {
        id: 32, nom: 'Wave', prefixes: ['70', '75', '76'],
        ussd: [{ id: 321, label: 'Transfert', code: '*999*{numero}*{montant}#' }],
      },
    ],
  },
  {
    id: 4, pays: 'Burkina Faso', nom: 'Burkina Faso', code: 'BF', indicatif: '+226', codePays: '+226', isDefault: false, estParDefaut: false,
    operateurs: [
      {
        id: 41, nom: 'Moov Burkina', prefixes: ['70', '71'],
        ussd: [{ id: 411, label: 'Transfert', code: '*555*{numero}*{montant}#' }],
      },
    ],
  },
  {
    id: 5, pays: 'Ghana', nom: 'Ghana', code: 'GH', indicatif: '+233', codePays: '+233', isDefault: false, estParDefaut: false,
    operateurs: [
      {
        id: 51, nom: 'MTN Ghana', prefixes: ['24', '54', '55'],
        ussd: [{ id: 511, label: 'Transfert', code: '*170*{numero}*{montant}#' }],
      },
    ],
  },
  {
    id: 6, pays: 'Kenya', nom: 'Kenya', code: 'KE', indicatif: '+254', codePays: '+254', isDefault: false, estParDefaut: false,
    operateurs: [
      {
        id: 61, nom: 'Airtel Kenya', prefixes: ['73', '78'],
        ussd: [{ id: 611, label: 'Transfert', code: '*334*{numero}*{montant}#' }],
      },
    ],
  },
  {
    id: 7, pays: 'Nigéria', nom: 'Nigéria', code: 'NG', indicatif: '+234', codePays: '+234', isDefault: false, estParDefaut: false,
    operateurs: [
      {
        id: 71, nom: 'MTN Nigeria', prefixes: ['80', '81', '70'],
        ussd: [{ id: 711, label: 'Transfert', code: '*904*{numero}*{montant}#' }],
      },
    ],
  },
  {
    id: 8, pays: 'Mali', nom: 'Mali', code: 'ML', indicatif: '+223', codePays: '+223', isDefault: false, estParDefaut: false,
    operateurs: [
      {
        id: 81, nom: 'Orange Mali', prefixes: ['76', '77'],
        ussd: [{ id: 811, label: 'Transfert', code: '*144*{numero}*{montant}#' }],
      },
    ],
  },
  {
    id: 9, pays: 'Tunisie', nom: 'Tunisie', code: 'TN', indicatif: '+216', codePays: '+216', isDefault: false, estParDefaut: false,
    operateurs: [
      {
        id: 91, nom: 'Ooredoo Tunisie', prefixes: ['20', '21', '22'],
        ussd: [{ id: 911, label: 'Transfert', code: '*180*{numero}*{montant}#' }],
      },
    ],
  },
];

export const MOCK_OPERATORS: OperatorDTO[] = MOCK_COUNTRIES.flatMap((c) =>
  c.operateurs.map((op) => ({
    ...op,
    countryId: String(c.id),
    countryName: c.pays,
  }))
);

export const MOCK_USSD_ACTIONS: UssdActionDTO[] = MOCK_OPERATORS.flatMap((op) =>
  op.ussd.map((u) => ({
    id: String(u.id),
    operatorId: String(op.id),
    operatorName: op.nom,
    nomAction: u.label,
    codeUSSD: u.code,
    format: u.code,
  }))
);
