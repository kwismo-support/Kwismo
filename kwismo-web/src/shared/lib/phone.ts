// Phone number parsing, international validation (E.164), and country helper utilities.
import {
  parsePhoneNumber,
  isValidPhoneNumber as isValidLibPhone,
  getCountryCallingCode,
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

const frNames = countries.getNames('fr');
const enNames = countries.getNames('en');

// Specific custom placeholders for African & major markets
const CUSTOM_PLACEHOLDERS: Record<string, string> = {
  CM: '690 00 00 00',
  CI: '07 01 02 03 04',
  SN: '77 000 00 00',
  GA: '066 00 00 00',
  CG: '06 000 00 00',
  CD: '810 000 000',
  TG: '90 00 00 00',
  BJ: '97 00 00 00',
  BF: '70 00 00 00',
  ML: '66 00 00 00',
  GN: '620 00 00 00',
  NE: '90 00 00 00',
  FR: '06 12 34 56 78',
  US: '(202) 555-0143',
  GB: '07123 456789',
  CA: '(416) 555-0143',
};

const PRIORITY_CODES = ['CM', 'CI', 'SN', 'GA', 'CG', 'CD', 'TG', 'BJ', 'BF', 'ML', 'GN', 'NE', 'FR', 'US', 'GB', 'CA'];

function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function getAllCountries(): CountryOption[] {
  const allCodes = Object.keys(frNames);
  const list: CountryOption[] = [];

  for (const iso2 of allCodes) {
    try {
      const dialCode = `+${getCountryCallingCode(iso2 as CountryCode)}`;
      const nameFr = frNames[iso2] || iso2;
      const nameEn = enNames[iso2] || nameFr;
      const lowerIso = iso2.toLowerCase();

      list.push({
        code: iso2 as CountryCode,
        nameFr,
        nameEn,
        dialCode,
        flag: getFlagEmoji(iso2),
        icon: `circle-flags:${lowerIso}`,
        examplePlaceholder: CUSTOM_PLACEHOLDERS[iso2] || '000 000 000',
      });
    } catch {
      // Ignore codes without valid calling codes in libphonenumber-js
    }
  }

  return list.sort((a, b) => {
    const aPriority = PRIORITY_CODES.indexOf(a.code);
    const bPriority = PRIORITY_CODES.indexOf(b.code);

    if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
    if (aPriority !== -1) return -1;
    if (bPriority !== -1) return 1;
    return a.nameFr.localeCompare(b.nameFr, 'fr');
  });
}

export const COUNTRY_LIST: CountryOption[] = getAllCountries();

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

