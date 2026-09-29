export type KwismoContactStatus =
  | 'compromised'
  | 'compromis'
  | 'whatsapp_alert'
  | 'alert'
  | 'frauduleux'
  | 'a_signaler'
  | 'suspect'
  | 'securise'
  | 'secured'
  | 'pending'
  | 'signalement'
  | 'transfert'
  | 'none'
  | (string & {});

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
