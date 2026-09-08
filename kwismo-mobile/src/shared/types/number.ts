export interface SimNumber {
  id: string;
  phone: string;
  operator: 'MTN' | 'ORANGE' | 'CAMTEL' | 'NEXTTEL';
  status: 'verified' | 'pending' | 'compromised';
  countryCode: string;
  callingCode: string;
}
