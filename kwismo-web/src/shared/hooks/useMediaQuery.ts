import { useState, useEffect } from 'react';

/**
 * Évalue une media query CSS et réagit aux changements.
 * Ex : const isMobile = useMediaQuery('(max-width: 768px)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql      = window.matchMedia(query);
    const handler  = (e: MediaQueryListEvent) => setMatches(e.matches);

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
