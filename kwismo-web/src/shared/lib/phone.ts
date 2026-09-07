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
  icon: string;
  examplePlaceholder: string;
}

export const COUNTRY_LIST: CountryOption[] = [
  { code: 'CM', nameFr: 'Cameroun', nameEn: 'Cameroon', dialCode: '+237', flag: '🇨🇲', icon: 'circle-flags:cm', examplePlaceholder: '690 00 00 00' },
  { code: 'CI', nameFr: "Côte d'Ivoire", nameEn: 'Ivory Coast', dialCode: '+225', flag: '🇨🇮', icon: 'circle-flags:ci', examplePlaceholder: '07 01 02 03 04' },
  { code: 'SN', nameFr: 'Sénégal', nameEn: 'Senegal', dialCode: '+221', flag: '🇸🇳', icon: 'circle-flags:sn', examplePlaceholder: '77 000 00 00' },
  { code: 'GA', nameFr: 'Gabon', nameEn: 'Gabon', dialCode: '+241', flag: '🇬🇦', icon: 'circle-flags:ga', examplePlaceholder: '066 00 00 00' },
  { code: 'CG', nameFr: 'Congo', nameEn: 'Congo', dialCode: '+242', flag: '🇨🇬', icon: 'circle-flags:cg', examplePlaceholder: '06 000 00 00' },
  { code: 'CD', nameFr: 'RDC', nameEn: 'DR Congo', dialCode: '+243', flag: '🇨🇩', icon: 'circle-flags:cd', examplePlaceholder: '810 000 000' },
  { code: 'TG', nameFr: 'Togo', nameEn: 'Togo', dialCode: '+228', flag: '🇹🇬', icon: 'circle-flags:tg', examplePlaceholder: '90 00 00 00' },
  { code: 'BJ', nameFr: 'Bénin', nameEn: 'Benin', dialCode: '+229', flag: '🇧🇯', icon: 'circle-flags:bj', examplePlaceholder: '97 00 00 00' },
  { code: 'BF', nameFr: 'Burkina Faso', nameEn: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫', icon: 'circle-flags:bf', examplePlaceholder: '70 00 00 00' },
  { code: 'ML', nameFr: 'Mali', nameEn: 'Mali', dialCode: '+223', flag: '🇲🇱', icon: 'circle-flags:ml', examplePlaceholder: '66 00 00 00' },
  { code: 'GN', nameFr: 'Guinée', nameEn: 'Guinea', dialCode: '+224', flag: '🇬🇳', icon: 'circle-flags:gn', examplePlaceholder: '620 00 00 00' },
  { code: 'NE', nameFr: 'Niger', nameEn: 'Niger', dialCode: '+227', flag: '🇳🇪', icon: 'circle-flags:ne', examplePlaceholder: '90 00 00 00' },
  { code: 'FR', nameFr: 'France', nameEn: 'France', dialCode: '+33', flag: '🇫🇷', icon: 'circle-flags:fr', examplePlaceholder: '06 12 34 56 78' },
  { code: 'US', nameFr: 'États-Unis', nameEn: 'United States', dialCode: '+1', flag: '🇺🇸', icon: 'circle-flags:us', examplePlaceholder: '(202) 555-0143' },
  { code: 'GB', nameFr: 'Royaume-Uni', nameEn: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', icon: 'circle-flags:gb', examplePlaceholder: '07123 456789' },
  { code: 'CA', nameFr: 'Canada', nameEn: 'Canada', dialCode: '+1', flag: '🇨🇦', icon: 'circle-flags:ca', examplePlaceholder: '(416) 555-0143' },
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
