export interface UserPhoneBackend {
  id: string;
  valeur: string;
  country_id: string;
  operator_id?: string | null;
  est_verifie: boolean;
  date_verification?: string | null;
  est_compromis: boolean;
  created_at: string;
}

export type PhoneStatus = 'verified' | 'pending' | 'compromised';

export interface UserSimNumber {
  id: string;
  phone: string;
  countryCode: string;
  callingCode: string;
  operator: string;
  status: PhoneStatus;
  addedDate?: string;
  rawValeur: string;
}

export interface AddPhonePayload {
  valeur: string;
}

export interface VerifyPhonePayload {
  code: string;
}
