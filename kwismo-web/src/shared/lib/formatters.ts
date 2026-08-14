/**
 * Formatters utilisant l'API Intl native du navigateur.
 * Pas de dépendance externe.
 */

/**
 * Formate un nombre entier avec séparateurs de milliers.
 * Ex : 1234567 → "1 234 567"
 */
export function formatNumber(value: number, locale = 'fr-FR'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Formate un montant en devise.
 * Ex : formatCurrency(5000, 'XAF') → "5 000 FCFA"
 */
export function formatCurrency(
  value: number,
  currency = 'XAF',
  locale = 'fr-FR',
): string {
  return new Intl.NumberFormat(locale, {
    style:    'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formate une date ISO en date lisible.
 * Ex : formatDate('2024-01-15') → "15 janv. 2024"
 */
export function formatDate(
  iso: string | Date,
  locale = 'fr-FR',
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(iso));
}

/**
 * Formate une date + heure.
 */
export function formatDateTime(iso: string | Date, locale = 'fr-FR'): string {
  return new Intl.DateTimeFormat(locale, {
    day:    'numeric',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

/**
 * Formate un numéro de téléphone international brut en lisible.
 * Ex : "+237690000000" → "+237 6 90 00 00 00"
 */
export function formatPhone(phone: string): string {
  return phone.replace(/(\+\d{1,3})(\d{1,2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5 $6');
}
