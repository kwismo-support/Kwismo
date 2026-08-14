import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant;
  size?:     Size;
  isLoading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:   'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500',
  secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus-visible:ring-secondary-500',
  outline:   'border border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900 focus-visible:ring-primary-500',
  ghost:     'text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900 focus-visible:ring-primary-500',
  danger:    'bg-danger text-white hover:opacity-90 focus-visible:ring-red-500',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {isLoading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
