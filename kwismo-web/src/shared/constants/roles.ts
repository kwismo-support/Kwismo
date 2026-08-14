import { ROLES } from '@/config/constants';

/**
 * Labels affichés pour chaque rôle (utilisés dans les composants UI).
 */
export const ROLE_LABELS: Record<string, string> = {
  [ROLES.ADMIN]:   'Administrateur',
  [ROLES.PARTNER]: 'Partenaire',
  [ROLES.USER]:    'Utilisateur',
};

/**
 * Couleurs de badge par rôle (classes Tailwind).
 */
export const ROLE_COLORS: Record<string, string> = {
  [ROLES.ADMIN]:   'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300',
  [ROLES.PARTNER]: 'bg-secondary-100 text-secondary-600 dark:bg-yellow-900 dark:text-yellow-300',
  [ROLES.USER]:    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};
