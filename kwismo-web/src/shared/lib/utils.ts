import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function truncate(str: string, max = 40): string {
  return str.length > max ? `${str.slice(0, max)}…` : str;
}


export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}


export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
