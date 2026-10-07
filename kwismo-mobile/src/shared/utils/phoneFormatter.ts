import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js/min';

export function formatPhoneNumber(phone?: string): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  if (!trimmed) return '';

  const parsed = parsePhoneNumberFromString(trimmed);
  if (parsed && parsed.isValid()) {
    return parsed.formatInternational();
  }

  return trimmed;
}

export function toE164Phone(
  phone?: string,
  callingCode?: string,
  countryCode?: string
): string {
  if (!phone) return '';
  const trimmed = phone.trim().replace(/\s+/g, '').replace(/-/g, '');
  if (!trimmed) return '';

  if (trimmed.startsWith('+')) {
    const parsed = parsePhoneNumberFromString(trimmed);
    if (parsed) return parsed.format('E.164');
    return trimmed;
  }

  if (trimmed.startsWith('00')) {
    const raw = '+' + trimmed.slice(2);
    const parsed = parsePhoneNumberFromString(raw);
    if (parsed) return parsed.format('E.164');
    return raw;
  }

  const prefix = callingCode ? (callingCode.startsWith('+') ? callingCode : `+${callingCode}`) : '';
  const rawWithPrefix = prefix ? `${prefix}${trimmed}` : `+${trimmed}`;

  const country = (countryCode || 'CM') as CountryCode;
  const parsed = parsePhoneNumberFromString(rawWithPrefix, country) || parsePhoneNumberFromString(trimmed, country);

  if (parsed) {
    return parsed.format('E.164');
  }

  return rawWithPrefix;
}
