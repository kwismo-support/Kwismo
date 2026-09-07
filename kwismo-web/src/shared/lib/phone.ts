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
    }
  }

  return list.sort((a, b) => a.nameFr.localeCompare(b.nameFr, 'fr'));
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
  }
  return phone;
}

export function formatInternational(phone: string, countryCode?: CountryCode): string {
  try {
    const parsed = parsePhoneNumber(phone, countryCode);
    if (parsed) return parsed.formatInternational();
  } catch {
  }
  return phone;
}

const TIMEZONE_COUNTRY_MAP: Record<string, CountryCode> = {
  'Africa/Douala': 'CM',
  'Africa/Lagos': 'NG',
  'Africa/Abidjan': 'CI',
  'Africa/Dakar': 'SN',
  'Africa/Libreville': 'GA',
  'Africa/Brazzaville': 'CG',
  'Africa/Kinshasa': 'CD',
  'Africa/Lubumbashi': 'CD',
  'Africa/Lome': 'TG',
  'Africa/Cotonou': 'BJ',
  'Africa/Ouagadougou': 'BF',
  'Africa/Bamako': 'ML',
  'Africa/Conakry': 'GN',
  'Africa/Niamey': 'NE',
  'Africa/Bangui': 'CF',
  'Africa/Ndjamena': 'TD',
  'Africa/Malabo': 'GQ',
  'Africa/Banjul': 'GM',
  'Africa/Freetown': 'SL',
  'Africa/Monrovia': 'LR',
  'Africa/Bissau': 'GW',
  'Africa/Praia': 'CV',
  'Africa/Luanda': 'AO',
  'Africa/Casablanca': 'MA',
  'Africa/Tunis': 'TN',
  'Africa/Algiers': 'DZ',
  'Africa/Cairo': 'EG',
  'Africa/Nairobi': 'KE',
  'Africa/Kampala': 'UG',
  'Africa/Kigali': 'RW',
  'Africa/Bujumbura': 'BI',
  'Africa/Dar_es_Salaam': 'TZ',
  'Africa/Addis_Ababa': 'ET',
  'Africa/Asmara': 'ER',
  'Africa/Djibouti': 'DJ',
  'Africa/Mogadishu': 'SO',
  'Africa/Khartoum': 'SD',
  'Africa/Juba': 'SS',
  'Africa/Johannesburg': 'ZA',
  'Africa/Harare': 'ZW',
  'Africa/Lusaka': 'ZM',
  'Africa/Maputo': 'MZ',
  'Europe/Paris': 'FR',
  'Europe/London': 'GB',
  'Europe/Brussels': 'BE',
  'Europe/Berlin': 'DE',
  'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT',
  'Europe/Geneva': 'CH',
  'Europe/Zurich': 'CH',
  'Europe/Amsterdam': 'NL',
  'Europe/Lisbon': 'PT',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Toronto': 'CA',
  'America/Montreal': 'CA',
  'America/Vancouver': 'CA',
  'America/Sao_Paulo': 'BR',
};

export function detectUserCountryCode(): CountryCode {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_COUNTRY_MAP[tz]) {
      return TIMEZONE_COUNTRY_MAP[tz];
    }
  } catch {}

  try {
    const languages = navigator.languages || [navigator.language];
    for (const lang of languages) {
      if (lang.includes('-')) {
        const region = lang.split('-')[1].toUpperCase();
        if (region.length === 2 && COUNTRY_LIST.some((c) => c.code === region)) {
          return region as CountryCode;
        }
      }
    }
  } catch {}

  return 'CM';
}


