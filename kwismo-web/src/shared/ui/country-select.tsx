import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { COUNTRY_LIST, detectUserCountryCode, type CountryOption } from '@/shared/lib/phone';

interface CountrySelectProps {
  value: string;
  onChange: (countryCode: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export function CountrySelect({ value, onChange, label, required = false, className = '' }: CountrySelectProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const lang = i18n.language.startsWith('en') ? 'en' : 'fr';

  const detectedCode = detectUserCountryCode();
  const selectedCountry = COUNTRY_LIST.find((c) => c.code === value) || COUNTRY_LIST.find((c) => c.code === detectedCode) || COUNTRY_LIST[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (country: CountryOption) => {
    onChange(country.code);
    setIsOpen(false);
    setSearchQuery('');
  };

  const filteredCountries = COUNTRY_LIST.filter((country) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const name = (lang === 'en' ? country.nameEn : country.nameFr).toLowerCase();
    const code = country.code.toLowerCase();
    const dial = country.dialCode.toLowerCase();
    return name.includes(q) || code.includes(q) || dial.includes(q);
  });

  return (
    <div className={`flex flex-col gap-1.5 font-body ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-navy text-slate-900 dark:text-white text-xs sm:text-sm font-semibold flex items-center justify-between hover:border-brand-green focus:outline-none focus:border-brand-green transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Icon icon={selectedCountry.icon} className="text-xl shrink-0" />
            <span className="truncate">
              {lang === 'en' ? selectedCountry.nameEn : selectedCountry.nameFr}
            </span>
            <span className="text-xs font-mono text-slate-400">({selectedCountry.dialCode})</span>
          </div>
          <Icon icon="solar:alt-arrow-down-linear" className={`text-xs transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-12 left-0 z-50 w-full max-h-80 overflow-hidden rounded-2xl bg-white dark:bg-brand-navy border border-slate-200 dark:border-white/15 shadow-2xl flex flex-col font-body animate-in fade-in zoom-in-95 duration-150">
            <div className="p-2 border-b border-slate-100 dark:border-white/10 sticky top-0 bg-white dark:bg-brand-navy z-10">
              <div className="relative flex items-center">
                <Icon icon="solar:magnifer-linear" className="absolute left-3 text-slate-400 text-sm" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un pays (nom, code, indicatif...)"
                  autoFocus
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-100 dark:bg-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-green"
                />
              </div>
            </div>

            <div className="overflow-y-auto p-1 max-h-64 divide-y divide-slate-50 dark:divide-white/5">
              {filteredCountries.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  Aucun pays trouvé
                </div>
              ) : (
                filteredCountries.map((country) => {
                  const isSelected = country.code === selectedCountry.code;
                  return (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleSelect(country)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition ${
                        isSelected
                          ? 'bg-brand-green/10 text-brand-green font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon icon={country.icon} className="text-xl shrink-0" />
                        <span className="truncate">
                          {lang === 'en' ? country.nameEn : country.nameFr}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 shrink-0">
                        <span>{country.dialCode}</span>
                        {isSelected && <Icon icon="solar:check-read-bold" className="text-brand-green text-sm" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
