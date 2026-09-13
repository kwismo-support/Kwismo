import React from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/shared/lib/utils';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline'
  | 'navy'
  | 'orange'
  | 'green'
  | 'mint'
  | 'blue';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  showDot?: boolean;
  dotPulse?: boolean;
  icon?: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; dot: string }> = {
  default: {
    bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-transparent',
    dot: 'bg-slate-500',
  },
  primary: {
    bg: 'bg-brand-navy/10 text-brand-navy dark:bg-brand-navy/40 dark:text-slate-200 border-brand-navy/20',
    dot: 'bg-brand-navy dark:bg-slate-300',
  },
  secondary: {
    bg: 'bg-brand-orange/15 text-brand-orange dark:bg-brand-orange/20 dark:text-brand-orange border-brand-orange/30',
    dot: 'bg-brand-orange',
  },
  success: {
    bg: 'bg-brand-green/15 text-brand-green dark:bg-brand-green/20 dark:text-brand-green border-brand-green/30',
    dot: 'bg-brand-green',
  },
  warning: {
    bg: 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/30',
    dot: 'bg-amber-500',
  },
  danger: {
    bg: 'bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/30',
    dot: 'bg-rose-500',
  },
  info: {
    bg: 'bg-brand-blue/15 text-brand-blue dark:bg-brand-blue/20 dark:text-brand-blue border-brand-blue/30',
    dot: 'bg-brand-blue',
  },
  outline: {
    bg: 'border border-[var(--color-border)] text-[var(--color-text-muted)] bg-transparent',
    dot: 'bg-slate-400',
  },
  navy: {
    bg: 'bg-brand-navy text-white border-transparent',
    dot: 'bg-brand-orange',
  },
  orange: {
    bg: 'bg-brand-orange text-white border-transparent',
    dot: 'bg-white',
  },
  green: {
    bg: 'bg-brand-green text-white border-transparent',
    dot: 'bg-white',
  },
  mint: {
    bg: 'bg-brand-mint text-brand-darkGreen border-brand-green/20',
    dot: 'bg-brand-darkGreen',
  },
  blue: {
    bg: 'bg-brand-blue text-white border-transparent',
    dot: 'bg-white',
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'px-2 py-0.5 text-[10px] font-semibold gap-1',
  sm: 'px-2.5 py-0.5 text-xs font-semibold gap-1.5',
  md: 'px-3 py-1 text-xs font-bold gap-1.5',
  lg: 'px-3.5 py-1.5 text-sm font-bold gap-2',
};

export function Badge({
  variant = 'default',
  size = 'sm',
  showDot = false,
  dotPulse = false,
  icon,
  children,
  className,
  ...props
}: BadgeProps) {
  const styleConfig = variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-body transition-colors border',
        styleConfig.bg,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {showDot && (
        <span className="relative flex h-2 w-2 items-center justify-center">
          {dotPulse && (
            <span
              className={cn(
                'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                styleConfig.dot
              )}
            />
          )}
          <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', styleConfig.dot)} />
        </span>
      )}

      {icon && (
        <span className="inline-flex shrink-0 items-center justify-center">
          {typeof icon === 'string' ? (
            <Icon icon={icon} className="text-current text-sm" />
          ) : (
            icon
          )}
        </span>
      )}

      <span>{children}</span>
    </span>
  );
}
