export function formatNumber(value: number, locale = 'fr-FR'): string {
  return new Intl.NumberFormat(locale).format(value);
}


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


export function formatDate(
  iso: string | Date,
  locale = 'fr-FR',
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(iso));
}


export function formatDateTime(iso: string | Date, locale = 'fr-FR'): string {
  return new Intl.DateTimeFormat(locale, {
    day:    'numeric',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}


export function formatPhone(phone: string): string {
  return phone.replace(/(\+\d{1,3})(\d{1,2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5 $6');
}
