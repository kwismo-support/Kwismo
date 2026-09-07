// International phone input component supporting country selection, live E.164 validation, and flag badges.
import { useState } from 'react';
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

  const lang = i18n.language.startsWith('en') ? 'en' : 'fr';

  const handleCountryChange = (code: string) => {
    const found = COUNTRY_LIST.find((c) => c.code === code) || COUNTRY_LIST[0];
    setSelectedCountry(found);
    validateAndUpdate(rawInput, found);
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

  return (
    <div className={`flex flex-col gap-1.5 font-body ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          <span className="absolute left-2.5 pointer-events-none flex items-center justify-center">
            <Icon icon={selectedCountry.icon} className="text-xl" />
          </span>
          <select
            value={selectedCountry.code}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="h-11 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-navy text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-brand-green cursor-pointer"
          >
            {COUNTRY_LIST.map((country) => (
              <option key={country.code} value={country.code}>
                {country.dialCode} ({lang === 'en' ? country.nameEn : country.nameFr})
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1">
          <input
            type="tel"
            value={rawInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="690 00 00 00"
            className={`w-full h-11 pl-4 pr-10 rounded-xl border bg-slate-50 dark:bg-brand-navy text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none ${
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
