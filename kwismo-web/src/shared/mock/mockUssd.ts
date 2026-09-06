export interface CountryDTO {
  id: string;
  nom: string;
  codePays: string;
  estParDefaut: boolean;
}

export interface OperatorDTO {
  id: string;
  nom: string;
  countryId: string;
  countryName: string;
  prefixes: string[];
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
  { id: 'c-cm', nom: 'Cameroun', codePays: '+237', estParDefaut: true },
  { id: 'c-ci', nom: "Côte d'Ivoire", codePays: '+225', estParDefaut: false },
  { id: 'c-sn', nom: 'Sénégal', codePays: '+221', estParDefaut: false },
];

export const MOCK_OPERATORS: OperatorDTO[] = [
  { id: 'op-or-cm', nom: 'Orange Cameroun', countryId: 'c-cm', countryName: 'Cameroun', prefixes: ['69', '655', '656', '657', '658', '659'] },
  { id: 'op-mtn-cm', nom: 'MTN Cameroun', countryId: 'c-cm', countryName: 'Cameroun', prefixes: ['67', '650', '651', '652', '653', '654'] },
  { id: 'op-or-ci', nom: "Orange Côte d'Ivoire", countryId: 'c-ci', countryName: "Côte d'Ivoire", prefixes: ['07', '08', '09'] },
];

export const MOCK_USSD_ACTIONS: UssdActionDTO[] = [
  { id: 'u-01', operatorId: 'op-or-cm', operatorName: 'Orange Cameroun', nomAction: 'Transfert OM', codeUSSD: '*150*1*1*', format: '*150*1*1*{numero}*{montant}#' },
  { id: 'u-02', operatorId: 'op-mtn-cm', operatorName: 'MTN Cameroun', nomAction: 'Transfert MoMo', codeUSSD: '*126*1*1*', format: '*126*1*1*{numero}*{montant}#' },
  { id: 'u-03', operatorId: 'op-or-cm', operatorName: 'Orange Cameroun', nomAction: 'Solde OM', codeUSSD: '*150*5#', format: '*150*5#' },
];
