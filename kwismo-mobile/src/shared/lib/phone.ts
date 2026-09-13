import { AsYouType, isValidPhoneNumber } from 'libphonenumber-js/min';

export function formatPhoneNumber(phone: string, countryCode: string = 'CM'): string {
  const formatter = new AsYouType(countryCode as any);
  return formatter.input(phone);
}

export function validatePhoneNumber(phone: string, countryCode: string = 'CM'): boolean {
  return isValidPhoneNumber(phone, countryCode as any);
}
