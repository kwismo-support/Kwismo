import React from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/shared/lib/utils';
import { CountrySelect } from '@/shared/ui/country-select';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterSelect {
  id: string;
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: FilterOption[];
  icon?: string;
}

export interface FilterBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  countryValue?: string;
  onCountryChange?: (countryCode: string) => void;
  selects?: FilterSelect[];
  viewMode?: 'table' | 'grid';
  onViewModeChange?: (mode: 'table' | 'grid') => void;
  onResetFilters?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Rechercher par nom, email, téléphone...',
  countryValue,
  onCountryChange,
  selects = [],
  viewMode,
  onViewModeChange,
  onResetFilters,
  onRefresh,
  onExport,
  children,
  className,
}: FilterBarProps) {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(countryValue && countryValue !== 'ALL') ||
    selects.some((s) => s.value && s.value !== 'ALL' && s.value !== '');

  return (
    <div
      className={cn(
        'flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-2xl',
        'bg-white dark:bg-brand-navy border border-slate-200 dark:border-white/10 shadow-sm font-body',
        className
      )}
    >
      <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
        {onSearchChange && (
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Icon
              icon="solar:magnifer-linear"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg"
            />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                'w-full h-10 pl-10 pr-9 rounded-xl border text-xs sm:text-sm transition',
                'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-brand-darkBg/60',
                'text-slate-900 dark:text-white placeholder:text-slate-400',
                'focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green'
              )}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <Icon icon="solar:close-circle-bold" className="text-base" />
              </button>
            )}
          </div>
        )}

        {onCountryChange && (
          <div className="min-w-[160px]">
            <CountrySelect
              value={countryValue || ''}
              onChange={onCountryChange}
            />
          </div>
        )}

        {selects.map((select) => (
          <div key={select.id} className="relative min-w-[140px]">
            {select.icon && (
              <Icon
                icon={select.icon}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"
              />
            )}
            <select
              value={select.value}
              onChange={(e) => select.onChange(e.target.value)}
              className={cn(
                'w-full h-10 rounded-xl border text-xs sm:text-sm appearance-none transition pr-8 cursor-pointer',
                select.icon ? 'pl-9' : 'pl-3',
                'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-brand-darkBg/60',
                'text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-green/30'
              )}
            >
              {select.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Icon
              icon="solar:alt-arrow-down-linear"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"
            />
          </div>
        ))}

        {children}
      </div>

      <div className="flex items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-white/5">
        {hasActiveFilters && onResetFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 h-10 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
          >
            <Icon icon="solar:restart-bold" className="text-sm" />
            <span>Réinitialiser</span>
          </button>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Rafraîchir"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-brand-darkBg/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition"
          >
            <Icon icon="solar:refresh-bold" className="text-base" />
          </button>
        )}

        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3.5 h-10 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 transition shadow-sm"
          >
            <Icon icon="solar:export-bold" className="text-sm text-brand-green" />
            <span>Exporter</span>
          </button>
        )}

        {onViewModeChange && viewMode && (
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-brand-darkBg/80 border border-slate-200 dark:border-white/10">
            <button
              onClick={() => onViewModeChange('table')}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg transition',
                viewMode === 'table'
                  ? 'bg-white dark:bg-brand-navy text-brand-green shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              )}
            >
              <Icon icon="solar:list-bold" className="text-base" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg transition',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-brand-navy text-brand-green shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              )}
            >
              <Icon icon="solar:widget-bold" className="text-base" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
