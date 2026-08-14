export type NumberStatus = 'safe' | 'suspect' | 'fraudulent' | 'unknown';

export interface PhoneNumber {
  id:          string;
  numero:      string;
  countryCode: string;
  status:      NumberStatus;
  reportCount: number;
  createdAt:   string;
  updatedAt:   string;
}

export interface VerifyResult {
  numero:  string;
  status:  NumberStatus;
  score:   number;        // 0–100
  details: string;
}
