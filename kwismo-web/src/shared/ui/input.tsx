import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import { Icon } from '@iconify/react';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:     string;
  error?:     string;
  errorKey?:  string;
  hint?:      string;
  sizeVariant?: InputSize;
  leftIcon?:  string | ReactNode;
  rightIcon?: string | ReactNode;
  isLoading?: boolean;
}

const inputSizes: Record<InputSize, string> = {
  sm: 'h-9 text-xs px-3 rounded-lg',
  md: 'h-11 text-sm px-4 rounded-xl',
  lg: 'h-12 text-base px-4 rounded-2xl',
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
      isLoading = false,
      id,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation(['errors', 'common']);
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 7)}`;

    // Resolve translated error message if errorKey is provided
    const displayError = errorKey ? t(errorKey) : error;

    return (
      <div className="flex flex-col gap-1.5 w-full font-body">
        {label && (
          <label htmlFor={inputId} className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <span className="absolute left-3.5 text-slate-400 text-lg flex items-center justify-center pointer-events-none">
              {typeof leftIcon === 'string' ? <Icon icon={leftIcon} /> : leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!displayError}
            aria-describedby={displayError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              'w-full bg-slate-50 dark:bg-[#0F1626] border border-slate-300 dark:border-white/10',
              'text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-body',
              'focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all duration-150',
              'disabled:cursor-not-allowed disabled:opacity-50',
              displayError && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500',
              inputSizes[sizeVariant],
              leftIcon && '!pl-11',
              (rightIcon || isLoading) && '!pr-11',
              className,
            )}
            {...props}
          />

          {isLoading ? (
            <span className="absolute right-3.5 text-slate-400 flex items-center justify-center">
              <Icon icon="solar:spinner-bold-duotone" className="animate-spin text-lg" />
            </span>
          ) : rightIcon ? (
            <span className="absolute right-3.5 text-slate-400 text-lg flex items-center justify-center">
              {typeof rightIcon === 'string' ? <Icon icon={rightIcon} /> : rightIcon}
            </span>
          ) : null}
        </div>

        {displayError && (
          <p id={`${inputId}-error`} className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-0.5" role="alert">
            <Icon icon="solar:danger-circle-bold" className="text-sm shrink-0" />
            <span>{displayError}</span>
          </p>
        )}

        {hint && !displayError && (
          <p id={`${inputId}-hint`} className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
