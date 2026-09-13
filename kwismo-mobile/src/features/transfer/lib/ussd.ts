// Utilitaire pour la construction et l'ouverture automatique des requêtes USSD Mobile Money
import { Linking } from 'react-native';

export function buildUssdCode(provider: 'MTN' | 'ORANGE', recipient: string, amount: number): string {
  const cleanPhone = recipient.replace(/\s+/g, '');
  if (provider === 'MTN') {
    return `*126*1*${cleanPhone}*${amount}#`;
  } else {
    return `*150*1*1*${cleanPhone}*${amount}#`;
  }
}

export async function launchUssd(ussdCode: string) {
  const url = `tel:${encodeURIComponent(ussdCode)}`;
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  } else {
    throw new Error('Impossible d ouvrir le composeur de numérotation USSD');
  }
}
