import { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';

export interface CountryItem {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export const WORLD_COUNTRIES: CountryItem[] = [
  { name: 'Cameroun', code: 'CM', dialCode: '+237', flag: 'circle-flags:cm' },
  { name: 'Côte d’Ivoire', code: 'CI', dialCode: '+225', flag: 'circle-flags:ci' },
  { name: 'Sénégal', code: 'SN', dialCode: '+221', flag: 'circle-flags:sn' },
  { name: 'Burkina Faso', code: 'BF', dialCode: '+226', flag: 'circle-flags:bf' },
  { name: 'Ghana', code: 'GH', dialCode: '+233', flag: 'circle-flags:gh' },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: 'circle-flags:ke' },
  { name: 'Nigéria', code: 'NG', dialCode: '+234', flag: 'circle-flags:ng' },
  { name: 'Mali', code: 'ML', dialCode: '+223', flag: 'circle-flags:ml' },
  { name: 'Tunisie', code: 'TN', dialCode: '+216', flag: 'circle-flags:tn' },
  { name: 'Bénin', code: 'BJ', dialCode: '+229', flag: 'circle-flags:bj' },
  { name: 'Togo', code: 'TG', dialCode: '+228', flag: 'circle-flags:tg' },
  { name: 'Gabon', code: 'GA', dialCode: '+241', flag: 'circle-flags:ga' },
  { name: 'Congo', code: 'CG', dialCode: '+242', flag: 'circle-flags:cg' },
  { name: 'RDC', code: 'CD', dialCode: '+243', flag: 'circle-flags:cd' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: 'circle-flags:fr' },
  { name: 'États-Unis', code: 'US', dialCode: '+1', flag: 'circle-flags:us' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: 'circle-flags:ca' },
  { name: 'Royaume-Uni', code: 'GB', dialCode: '+44', flag: 'circle-flags:gb' },
  { name: 'Allemagne', code: 'DE', dialCode: '+49', flag: 'circle-flags:de' },
  { name: 'Belgique', code: 'BE', dialCode: '+32', flag: 'circle-flags:be' },
  { name: 'Suisse', code: 'CH', dialCode: '+41', flag: 'circle-flags:ch' },
  { name: 'Maroc', code: 'MA', dialCode: '+212', flag: 'circle-flags:ma' },
  { name: 'Algérie', code: 'DZ', dialCode: '+213', flag: 'circle-flags:dz' },
  { name: 'Égypte', code: 'EG', dialCode: '+20', flag: 'circle-flags:eg' },
  { name: 'Afrique du Sud', code: 'ZA', dialCode: '+27', flag: 'circle-flags:za' },
];

interface CountrySelectProps {
  value: string;
  onChange: (countryName: string) => void;
  placeholder?: string;
  className?: string;
  showAllOption?: boolean;
}

export function CountrySelect({
  value,
  onChange,
  placeholder = 'Tous les pays',
  className = '',
  showAllOption = true,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCountry = useMemo(
    () => WORLD_COUNTRIES.find((c) => c.name.toLowerCase() === value.toLowerCase()),
    [value]
  );

  const filteredCountries = useMemo(
    () =>
      WORLD_COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.dialCode.includes(search)
      ),
    [search]
  );

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] text-slate-800 dark:text-slate-200 text-xs sm:text-sm flex items-center justify-between gap-2 hover:bg-slate-100 dark:hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-2 truncate">
          {selectedCountry ? (
            <>
              <Icon icon={selectedCountry.flag} className="text-lg shrink-0" />
              <span className="truncate font-medium">{selectedCountry.name}</span>
            </>
          ) : (
            <>
              <Icon icon="solar:globe-linear" className="text-base text-slate-400 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400 truncate">{placeholder}</span>
            </>
          )}
        </div>
        <Icon icon="solar:alt-arrow-down-linear" className="text-slate-400 text-xs shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-12 z-50 w-64 p-2 bg-white dark:bg-[#161E33] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl space-y-2 font-body">
            <div className="relative">
              <Icon
                icon="solar:magnifer-linear"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
              />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un pays..."
                className="w-full h-8 pl-8 pr-3 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-green"
              />
            </div>

            <div className="max-h-56 overflow-y-auto space-y-0.5">
              {showAllOption && (
                <button
                  type="button"
                  onClick={() => {
                    onChange('ALL');
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-xs rounded-xl text-left flex items-center gap-2 transition ${
                    value === 'ALL' || !value
                      ? 'bg-brand-navy text-white dark:bg-brand-orange dark:text-brand-navy font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon icon="solar:globe-bold-duotone" className="text-base shrink-0" />
                  <span>{placeholder}</span>
                </button>
              )}

              {filteredCountries.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onChange(c.name);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-xs rounded-xl text-left flex items-center justify-between gap-2 transition ${
                    value.toLowerCase() === c.name.toLowerCase()
                      ? 'bg-brand-navy text-white dark:bg-brand-orange dark:text-brand-navy font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon icon={c.flag} className="text-base shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </div>
                  <span className="text-[10px] opacity-70 font-mono">{c.dialCode}</span>
                </button>
              ))}

              {filteredCountries.length === 0 && (
                <p className="text-xs text-slate-400 p-3 text-center">Aucun pays trouvé</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
