// International phone input component supporting searchable country selection, live E.164 validation, vector flag badges, and dynamic placeholders.
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { COUNTRY_LIST, validatePhone, formatE164, type CountryOption } from '@/shared/lib/phone';
import type { CountryCode } from 'libphonenumber-js';

interface PhoneInputProps {
  value: string;
  onChange: (e164Value: string, isValid: boolean) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export function PhoneInput({ value, onChange, label, required = false, className = '' }: PhoneInputProps) {
  const { i18n } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(COUNTRY_LIST[0]);
  const [rawInput, setRawInput] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const lang = i18n.language.startsWith('en') ? 'en' : 'fr';

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country: CountryOption) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    validateAndUpdate(rawInput, country);
  };

  const handleInputChange = (val: string) => {
    setRawInput(val);
    validateAndUpdate(val, selectedCountry);
  };

  const validateAndUpdate = (val: string, country: CountryOption) => {
    const fullString = val.startsWith('+') ? val : `${country.dialCode}${val.replace(/^0+/, '')}`;
    const isValid = validatePhone(fullString, country.code as CountryCode);
    const normalized = isValid ? formatE164(fullString, country.code as CountryCode) : fullString;
    onChange(normalized, isValid);
  };

  const isValid = validatePhone(
    rawInput.startsWith('+') ? rawInput : `${selectedCountry.dialCode}${rawInput.replace(/^0+/, '')}`,
    selectedCountry.code as CountryCode,
  );

  const filteredCountries = COUNTRY_LIST.filter((country) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const name = (lang === 'en' ? country.nameEn : country.nameFr).toLowerCase();
    const code = country.code.toLowerCase();
    const dial = country.dialCode.toLowerCase();
    return name.includes(q) || code.includes(q) || dial.includes(q);
  });

  return (
    <div className={`flex flex-col gap-1.5 font-body ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div className="flex items-center gap-2 relative">
        {/* Searchable Country Selector Popover */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="h-11 px-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-navy text-slate-900 dark:text-white text-xs sm:text-sm font-semibold flex items-center gap-2 hover:border-brand-green focus:outline-none focus:border-brand-green transition shrink-0"
          >
            <Icon icon={selectedCountry.icon} className="text-xl" />
            <span>{selectedCountry.dialCode}</span>
            <Icon icon="solar:alt-arrow-down-linear" className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu with Search */}
          {isOpen && (
            <div className="absolute top-12 left-0 z-50 w-72 max-h-80 overflow-hidden rounded-2xl bg-white dark:bg-brand-navy border border-slate-200 dark:border-white/15 shadow-2xl flex flex-col font-body animate-in fade-in zoom-in-95 duration-150">
              {/* Search Bar */}
              <div className="p-2 border-b border-slate-100 dark:border-white/10 sticky top-0 bg-white dark:bg-brand-navy z-10">
                <div className="relative flex items-center">
                  <Icon icon="solar:magnifer-linear" className="absolute left-3 text-slate-400 text-sm" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher (nom, code, +237...)"
                    autoFocus
                    className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-100 dark:bg-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-green"
                  />
                </div>
              </div>

              {/* Country List */}
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
                        onClick={() => handleCountrySelect(country)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition ${
                          isSelected
                            ? 'bg-brand-green/10 text-brand-green font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon icon={country.icon} className="text-xl shrink-0" />
                          <span className="truncate max-w-[130px]">
                            {lang === 'en' ? country.nameEn : country.nameFr}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
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

        {/* Input Field with Dynamic Placeholder */}
        <div className="relative flex-1">
          <input
            type="tel"
            value={rawInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={selectedCountry.examplePlaceholder || '690 00 00 00'}
            className={`w-full h-11 pl-4 pr-10 rounded-xl border bg-slate-50 dark:bg-brand-navy text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none transition ${
              rawInput
                ? isValid
                  ? 'border-brand-green focus:border-brand-green'
                  : 'border-danger focus:border-danger'
                : 'border-slate-300 dark:border-white/10 focus:border-brand-green'
            }`}
          />

          {rawInput && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              <Icon
                icon={isValid ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                className={`text-lg ${isValid ? 'text-brand-green' : 'text-danger'}`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

