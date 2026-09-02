import { parsePhoneNumberFromString, getCountryCallingCode, CountryCode } from 'libphonenumber-js';

export interface CountryInfo {
  code: CountryCode;
  nameFr: string;
  nameEn: string;
  callingCode: string;
  flag: string;
}

export const COUNTRIES_LIST: CountryInfo[] = [
  { code: 'CM', nameFr: 'Cameroun', nameEn: 'Cameroon', callingCode: '+237', flag: '🇨🇲' },
  { code: 'FR', nameFr: 'France', nameEn: 'France', callingCode: '+33', flag: '🇫🇷' },
  { code: 'CI', nameFr: "Côte d'Ivoire", nameEn: 'Ivory Coast', callingCode: '+225', flag: '🇨🇮' },
  { code: 'SN', nameFr: 'Sénégal', nameEn: 'Senegal', callingCode: '+221', flag: '🇸🇳' },
  { code: 'GA', nameFr: 'Gabon', nameEn: 'Gabon', callingCode: '+241', flag: '🇬🇦' },
  { code: 'CG', nameFr: 'Congo-Brazzaville', nameEn: 'Congo', callingCode: '+242', flag: '🇨🇬' },
  { code: 'CD', nameFr: 'RD Congo', nameEn: 'DR Congo', callingCode: '+243', flag: '🇨🇩' },
  { code: 'NG', nameFr: 'Nigeria', nameEn: 'Nigeria', callingCode: '+234', flag: '🇳🇬' },
  { code: 'BE', nameFr: 'Belgique', nameEn: 'Belgium', callingCode: '+32', flag: '🇧🇪' },
  { code: 'CA', nameFr: 'Canada', nameEn: 'Canada', callingCode: '+1', flag: '🇨🇦' },
  { code: 'US', nameFr: 'États-Unis', nameEn: 'United States', callingCode: '+1', flag: '🇺🇸' },
  { code: 'CH', nameFr: 'Suisse', nameEn: 'Switzerland', callingCode: '+41', flag: '🇨🇭' },
  { code: 'GB', nameFr: 'Royaume-Uni', nameEn: 'United Kingdom', callingCode: '+44', flag: '🇬🇧' },
  { code: 'DE', nameFr: 'Allemagne', nameEn: 'Germany', callingCode: '+49', flag: '🇩🇪' },
  { code: 'IT', nameFr: 'Italie', nameEn: 'Italy', callingCode: '+39', flag: '🇮🇹' },
  { code: 'ES', nameFr: 'Espagne', nameEn: 'Spain', callingCode: '+34', flag: '🇪🇸' },
  { code: 'MA', nameFr: 'Maroc', nameEn: 'Morocco', callingCode: '+212', flag: '🇲🇦' },
  { code: 'TN', nameFr: 'Tunisie', nameEn: 'Tunisia', callingCode: '+216', flag: '🇹🇳' },
  { code: 'DZ', nameFr: 'Algérie', nameEn: 'Algeria', callingCode: '+213', flag: '🇩🇿' },
  { code: 'ML', nameFr: 'Mali', nameEn: 'Mali', callingCode: '+223', flag: '🇲🇱' },
  { code: 'GN', nameFr: 'Guinée', nameEn: 'Guinea', callingCode: '+224', flag: '🇬🇳' },
  { code: 'BF', nameFr: 'Burkina Faso', nameEn: 'Burkina Faso', callingCode: '+226', flag: '🇧🇫' },
  { code: 'NE', nameFr: 'Niger', nameEn: 'Niger', callingCode: '+227', flag: '🇳🇪' },
  { code: 'TG', nameFr: 'Togo', nameEn: 'Togo', callingCode: '+228', flag: '🇹🇬' },
  { code: 'BJ', nameFr: 'Bénin', nameEn: 'Benin', callingCode: '+229', flag: '🇧🇯' },
  { code: 'TD', nameFr: 'Tchad', nameEn: 'Chad', callingCode: '+235', flag: '🇹🇩' },
  { code: 'CF', nameFr: 'Centrafrique', nameEn: 'Central African Republic', callingCode: '+236', flag: '🇨🇫' },
  { code: 'GQ', nameFr: 'Guinée Équatoriale', nameEn: 'Equatorial Guinea', callingCode: '+240', flag: '🇬🇶' },
  { code: 'RW', nameFr: 'Rwanda', nameEn: 'Rwanda', callingCode: '+250', flag: '🇷🇼' },
  { code: 'GH', nameFr: 'Ghana', nameEn: 'Ghana', callingCode: '+233', flag: '🇬🇭' },
  { code: 'KE', nameFr: 'Kenya', nameEn: 'Kenya', callingCode: '+254', flag: '🇰🇪' },
  { code: 'ZA', nameFr: 'Afrique du Sud', nameEn: 'South Africa', callingCode: '+27', flag: '🇿🇦' },
  { code: 'AE', nameFr: 'Émirats Arabes Unis', nameEn: 'United Arab Emirates', callingCode: '+971', flag: '🇦🇪' },
  { code: 'SA', nameFr: 'Arabie Saoudite', nameEn: 'Saudi Arabia', callingCode: '+966', flag: '🇸🇦' },
  { code: 'CN', nameFr: 'Chine', nameEn: 'China', callingCode: '+86', flag: '🇨🇳' },
  { code: 'IN', nameFr: 'Inde', nameEn: 'India', callingCode: '+91', flag: '🇮🇳' },
  { code: 'BR', nameFr: 'Brésil', nameEn: 'Brazil', callingCode: '+55', flag: '🇧🇷' },
];

export const detectCountryByIP = async (): Promise<CountryInfo> => {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      const code = data.country_code as CountryCode;
      const found = COUNTRIES_LIST.find((c) => c.code === code);
      if (found) return found;
      try {
        const callCode = `+${getCountryCallingCode(code)}`;
        return {
          code,
          nameFr: data.country_name || code,
          nameEn: data.country_name || code,
          callingCode: callCode,
          flag: '🌐',
        };
      } catch {
        // fallback
      }
    }
  } catch {
    // fallback
  }
  return COUNTRIES_LIST[0]; // Cameroun par défaut
};

export const validatePhoneNumber = (
  rawNumber: string,
  countryCode: CountryCode = 'CM'
): { isValid: boolean; formatted: string; fullE164: string } => {
  const clean = rawNumber.trim();
  if (!clean) {
    return { isValid: false, formatted: '', fullE164: '' };
  }

  try {
    const parsed = parsePhoneNumberFromString(clean, countryCode);
    if (parsed && parsed.isValid()) {
      return {
        isValid: true,
        formatted: parsed.formatNational(),
        fullE164: parsed.format('E.164'),
      };
    }
  } catch {
    // ignore
  }

  return { isValid: false, formatted: clean, fullE164: '' };
};
