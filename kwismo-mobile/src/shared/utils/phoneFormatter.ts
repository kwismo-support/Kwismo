export function formatPhoneNumber(phone?: string): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  if (!trimmed) return '';

  const cleanDigits = trimmed.replace(/\D/g, '');
  if (!cleanDigits) return trimmed;

  if (trimmed.startsWith('+') || cleanDigits.length >= 11) {
    if (cleanDigits.startsWith('237')) {
      const rest = cleanDigits.slice(3);
      if (rest.length === 9) {
        return `+237 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`;
      } else if (rest.length === 8) {
        return `+237 ${rest.slice(0, 2)} ${rest.slice(2, 4)} ${rest.slice(4, 6)} ${rest.slice(6)}`;
      }
      return `+237 ${rest}`;
    }
    const cc = cleanDigits.slice(0, 3);
    const rest = cleanDigits.slice(3);
    if (rest.length === 9) {
      return `+${cc} ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`;
    }
    return `+${cc} ${rest}`;
  } else if (cleanDigits.length === 9) {
    return `${cleanDigits.slice(0, 3)} ${cleanDigits.slice(3, 6)} ${cleanDigits.slice(6)}`;
  }

  return trimmed;
}
