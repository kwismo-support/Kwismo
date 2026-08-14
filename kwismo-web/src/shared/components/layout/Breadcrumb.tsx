import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ROUTE_LABELS: Record<string, string> = {
  app:        'nav.home',
  dashboard:  'nav.dashboard',
  users:      'nav.users',
  numbers:    'nav.numbers',
  partners:   'nav.partners',
  ussd:       'nav.ussd',
  access:     'nav.access',
  reports:    'nav.reports',
};

export function Breadcrumb() {
  const { pathname } = useLocation();
  const { t }        = useTranslation('common');

  const segments = pathname
    .split('/')
    .filter(Boolean)
    .map((seg, i, arr) => ({
      label: ROUTE_LABELS[seg] ? t(ROUTE_LABELS[seg]) : seg,
      path:  '/' + arr.slice(0, i + 1).join('/'),
      isLast: i === arr.length - 1,
    }));

  if (segments.length <= 1) return null;

  return (
    <nav aria-label="Fil d'Ariane" className="hidden sm:flex items-center gap-1 text-sm">
      {segments.map((seg) => (
        <span key={seg.path} className="flex items-center gap-1">
          {!seg.isLast ? (
            <>
              <Link
                to={seg.path}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                {seg.label}
              </Link>
              <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
            </>
          ) : (
            <span className="font-medium text-[var(--color-text)]">{seg.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
