import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import { Icon } from '@iconify/react';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  errorKey?: string;
  hint?: string;
  sizeVariant?: InputSize;
  leftIcon?: string | ReactNode;
  rightIcon?: string | ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  isLoading?: boolean;
}

const inputSizes: Record<InputSize, string> = {
  sm: 'h-9 text-xs px-3 rounded-xl',
  md: 'h-10 text-xs sm:text-sm px-3.5 rounded-xl',
  lg: 'h-12 text-sm sm:text-base px-4 rounded-2xl',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      errorKey,
      hint,
      sizeVariant = 'md',
      leftIcon,
      rightIcon,
      clearable = false,
      onClear,
      isLoading = false,
      id,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation(['errors', 'common']);
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 7)}`;

    const displayError = errorKey ? t(errorKey) : error;
    const hasValue = value !== undefined && value !== '';

    return (
      <div className="flex flex-col gap-1.5 w-full font-body">
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <span className="absolute left-3 text-slate-400 text-base flex items-center justify-center pointer-events-none">
              {typeof leftIcon === 'string' ? <Icon icon={leftIcon} /> : leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            value={value}
            onChange={onChange}
            aria-invalid={!!displayError}
            aria-describedby={displayError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              'w-full bg-slate-50 dark:bg-brand-darkBg/60 border border-slate-200 dark:border-white/10',
              'text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-body',
              'focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all duration-150',
              'disabled:cursor-not-allowed disabled:opacity-50',
              displayError && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
              inputSizes[sizeVariant],
              leftIcon && '!pl-9',
              (rightIcon || isLoading || (clearable && hasValue)) && '!pr-9',
              className
            )}
            {...props}
          />

          {isLoading ? (
            <span className="absolute right-3 text-slate-400 flex items-center justify-center pointer-events-none">
              <Icon icon="solar:spinner-bold-duotone" className="animate-spin text-base" />
            </span>
          ) : clearable && hasValue ? (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-white transition flex items-center justify-center"
            >
              <Icon icon="solar:close-circle-bold" className="text-base" />
            </button>
          ) : rightIcon ? (
            <span className="absolute right-3 text-slate-400 text-base flex items-center justify-center pointer-events-none">
              {typeof rightIcon === 'string' ? <Icon icon={rightIcon} /> : rightIcon}
            </span>
          ) : null}
        </div>

        {displayError && (
          <p id={`${inputId}-error`} className="text-xs text-rose-500 font-semibold flex items-center gap-1 mt-0.5" role="alert">
            <Icon icon="solar:danger-circle-bold" className="text-sm shrink-0" />
            <span>{displayError}</span>
          </p>
        )}

        {hint && !displayError && (
          <p id={`${inputId}-hint`} className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
