// Phone number parsing, international validation (E.164), and country helper utilities.
import {
  parsePhoneNumber,
  isValidPhoneNumber as isValidLibPhone,
  CountryCode,
} from 'libphonenumber-js';
import countries from 'i18n-iso-countries';
import frLocale from 'i18n-iso-countries/langs/fr.json';
import enLocale from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(frLocale);
countries.registerLocale(enLocale);

export interface CountryOption {
  code: CountryCode;
  nameFr: string;
  nameEn: string;
  dialCode: string;
  flag: string;
}

export const COUNTRY_LIST: CountryOption[] = [
  { code: 'CM', nameFr: 'Cameroun', nameEn: 'Cameroon', dialCode: '+237', flag: '🇨🇲' },
  { code: 'CI', nameFr: "Côte d'Ivoire", nameEn: 'Ivory Coast', dialCode: '+225', flag: '🇨🇮' },
  { code: 'SN', nameFr: 'Sénégal', nameEn: 'Senegal', dialCode: '+221', flag: '🇸🇳' },
  { code: 'GA', nameFr: 'Gabon', nameEn: 'Gabon', dialCode: '+241', flag: '🇬🇦' },
  { code: 'CG', nameFr: 'Congo', nameEn: 'Congo', dialCode: '+242', flag: '🇨🇬' },
  { code: 'CD', nameFr: 'RDC', nameEn: 'DR Congo', dialCode: '+243', flag: '🇨🇩' },
  { code: 'TG', nameFr: 'Togo', nameEn: 'Togo', dialCode: '+228', flag: '🇹🇬' },
  { code: 'BJ', nameFr: 'Bénin', nameEn: 'Benin', dialCode: '+229', flag: '🇧🇯' },
  { code: 'BF', nameFr: 'Burkina Faso', nameEn: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫' },
  { code: 'ML', nameFr: 'Mali', nameEn: 'Mali', dialCode: '+223', flag: '🇲🇱' },
  { code: 'GN', nameFr: 'Guinée', nameEn: 'Guinea', dialCode: '+224', flag: '🇬🇳' },
  { code: 'NE', nameFr: 'Niger', nameEn: 'Niger', dialCode: '+227', flag: '🇳🇪' },
  { code: 'FR', nameFr: 'France', nameEn: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'US', nameFr: 'États-Unis', nameEn: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', nameFr: 'Royaume-Uni', nameEn: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', nameFr: 'Canada', nameEn: 'Canada', dialCode: '+1', flag: '🇨🇦' },
];

export function validatePhone(phone: string, countryCode?: CountryCode): boolean {
  if (!phone.trim()) return false;
  try {
    return isValidLibPhone(phone, countryCode);
  } catch {
    return false;
  }
}

export function formatE164(phone: string, countryCode?: CountryCode): string {
  try {
    const parsed = parsePhoneNumber(phone, countryCode);
    if (parsed) return parsed.format('E.164');
  } catch {
    // Return original string if parse fails
  }
  return phone;
}

export function formatInternational(phone: string, countryCode?: CountryCode): string {
  try {
    const parsed = parsePhoneNumber(phone, countryCode);
    if (parsed) return parsed.formatInternational();
  } catch {
    // Return original string if parse fails
  }
  return phone;
}
