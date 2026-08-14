import { useState, useEffect } from 'react';

/**
 * Retarde la mise à jour d'une valeur de `delay` millisecondes.
 * Utile pour éviter des requêtes API à chaque frappe.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
