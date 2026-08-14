import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Fusionne des classes Tailwind sans conflits.
 * Usage : cn('px-2 py-1', condition && 'bg-red-500')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Tronque une chaîne à `max` caractères.
 */
export function truncate(str: string, max = 40): string {
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

/**
 * Retourne la valeur d'une clé imbriquée via un chemin pointé.
 * Ex : getNestedValue({ a: { b: 1 } }, 'a.b') → 1
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Génère un identifiant unique léger (non cryptographique).
 */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
