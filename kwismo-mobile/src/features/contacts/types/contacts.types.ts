export type KwismoContactStatus =
  | 'compromised'
  | 'pending'
  | 'secured'
  | 'signalement'
  | 'transfert'
  | 'none';

export interface ContactItem {
  id: string;
  name: string;
  phone: string;
  hasKwismo: boolean;
  kwismoStatus: KwismoContactStatus;
  countryCode?: string;
  callingCode?: string;
}

export interface AddContactPayload {
  nom: string;
  prenom: string;
  callingCode: string;
  countryCode: string;
  phone: string;
}
