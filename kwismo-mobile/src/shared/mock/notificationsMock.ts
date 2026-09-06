export interface NotificationItem {
  id: string;
  type: 'security' | 'transfer' | 'sim' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'security',
    title: 'Alerte d’usurpation détectée !',
    message: 'Une tentative d’utilisation non autorisée du numéro +237 6 98 44 43 88 a été stoppée.',
    timestamp: 'Il y a 10 min',
    read: false,
    actionUrl: '/(app)/management',
  },
  {
    id: 'notif-2',
    type: 'transfer',
    title: 'Transfert d’argent sécurisé',
    message: 'Code USSD généré avec succès pour le bénéficiaire +237 6 77 12 34 56.',
    timestamp: 'Hier à 14:32',
    read: false,
    actionUrl: '/(app)/transfer',
  },
  {
    id: 'notif-3',
    type: 'sim',
    title: 'Nouvelle puce SIM associée',
    message: 'Le numéro +237 6 55 99 00 11 est désormais protégé sous votre compte.',
    timestamp: '02 Sept.',
    read: true,
    actionUrl: '/(app)/management',
  },
  {
    id: 'notif-4',
    type: 'system',
    title: 'Mise à jour de sécurité Kwismo',
    message: 'La version 2.4 de Kwismo intègre une protection accrue contre la dépréciation SIM.',
    timestamp: '30 Août',
    read: true,
  },
];
