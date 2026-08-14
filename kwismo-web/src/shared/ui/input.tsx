import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:    string;
  error?:    string;
  hint?:     string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, id, ...props }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 7)}`;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text)]">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              'w-full rounded border bg-[var(--color-bg-subtle)] px-3 py-2 text-sm',
              'text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]',
              'border-[var(--color-border)] transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-red-500 focus:ring-red-500',
              leftIcon && 'pl-10',
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-[var(--color-text-muted)]">
            {hint}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
