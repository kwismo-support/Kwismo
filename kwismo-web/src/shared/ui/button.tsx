import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import { Icon } from '@iconify/react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'navy'
  | 'darkGreen'
  | 'mint'
  | 'soft'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: string | ReactNode;
  rightIcon?: string | ReactNode;
  circlePillIcon?: string;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-green text-white hover:bg-[#2aa072] focus-visible:ring-brand-green shadow-sm',
  secondary:
    'bg-brand-orange text-white hover:bg-[#e08700] focus-visible:ring-brand-orange shadow-sm',
  navy:
    'bg-brand-navy text-white hover:bg-slate-800 dark:bg-brand-orange dark:text-brand-navy dark:hover:bg-brand-orange/90 focus-visible:ring-brand-navy shadow-sm',
  darkGreen:
    'bg-[#104E37] text-white hover:bg-[#0d3f2c] focus-visible:ring-[#104E37] shadow-sm',
  mint:
    'bg-brand-mint text-brand-darkGreen hover:bg-brand-mint/80 border border-brand-green/20 focus-visible:ring-brand-green',
  soft:
    'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 focus-visible:ring-slate-400',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600 shadow-sm',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600 shadow-sm',
  outline:
    'border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-200 bg-white dark:bg-brand-navy hover:bg-slate-50 dark:hover:bg-white/10 focus-visible:ring-slate-400 shadow-xs',
  ghost:
    'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 focus-visible:ring-slate-400',
};

const sizes: Record<ButtonSize, string> = {
  xs: 'h-8 px-2.5 text-xs rounded-lg gap-1.5 font-semibold',
  sm: 'h-9 px-3.5 text-xs rounded-xl gap-2 font-semibold',
  md: 'h-10 px-4.5 text-xs sm:text-sm rounded-xl gap-2 font-semibold',
  lg: 'h-12 px-6 text-sm sm:text-base rounded-2xl gap-2.5 font-bold',
  xl: 'h-14 px-8 text-base sm:text-lg rounded-2xl gap-3 font-bold',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      circlePillIcon,
      fullWidth = false,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={cn(
        'inline-flex items-center justify-center font-body transition-all duration-150 active:scale-[0.98] cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        fullWidth && 'w-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Icon icon="solar:spinner-bold-duotone" className="animate-spin text-lg" />
      ) : (
        <>
          {leftIcon &&
            (typeof leftIcon === 'string' ? (
              <Icon icon={leftIcon} className="text-lg shrink-0" />
            ) : (
              leftIcon
            ))}

          {children && <span>{children}</span>}

          {rightIcon &&
            (typeof rightIcon === 'string' ? (
              <Icon icon={rightIcon} className="text-lg shrink-0" />
            ) : (
              rightIcon
            ))}

          {circlePillIcon && (
            <span className="ml-1.5 w-6 h-6 rounded-full bg-white text-slate-900 flex items-center justify-center shrink-0 shadow-sm">
              <Icon icon={circlePillIcon} className="text-sm font-bold" />
            </span>
          )}
        </>
      )}
    </button>
  )
);

Button.displayName = 'Button';
