import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/ui/button';
import type { CountryDTO } from '@/shared/mock';

interface CountriesPanelProps {
  countries: CountryDTO[];
  isLoading?: boolean;
  onAddCountry?: () => void;
}

export default function CountriesPanel({ countries, isLoading = false, onAddCountry }: CountriesPanelProps) {
  const { t } = useTranslation(['admin', 'common']);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm animate-pulse font-body">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-48 mb-2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm font-body">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
            {t('admin:ussd.countries')}
          </h3>
        </div>
        {onAddCountry && (
          <Button size="xs" variant="primary" leftIcon="solar:global-bold" onClick={onAddCountry}>
            {t('admin:ussd.addCountry')}
          </Button>
        )}
      </div>

      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {countries.map((c) => (
          <div key={c.id} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green font-title font-bold text-sm">
                <Icon icon={`circle-flags:${(c.code || c.codePays || 'cm').toLowerCase().replace('+', '')}`} className="text-2xl shrink-0" />
              </div>
              <div>
                <h4 className="font-title text-sm font-bold text-slate-900 dark:text-white">{c.nom || c.pays}</h4>
                <p className="font-mono text-xs text-slate-500">{c.indicatif || c.codePays}</p>
              </div>
            </div>
            {c.estParDefaut && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {t('common:yes')}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
