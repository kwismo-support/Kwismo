import { Icon } from '@iconify/react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  period?: string;
  icon?: string;
  iconBgColor?: string;
  color?: string;
  progress?: number;
  badgeText?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'mint';
  variant?: 'standard' | 'featured' | 'compact';
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  period,
  icon,
  iconBgColor,
  color = 'text-brand-green bg-brand-green/10 dark:bg-brand-green/20',
  progress,
  badgeText,
  badgeVariant = 'mint',
  variant = 'standard',
  isLoading = false,
  onClick,
  className,
}: KpiCardProps) {
  const activeIconBg = iconBgColor || color;

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex flex-col p-5 rounded-2xl border border-slate-200 dark:border-white/10',
          'bg-white dark:bg-[#161E33] shadow-sm animate-pulse',
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="h-3.5 bg-slate-200 dark:bg-white/10 rounded w-28" />
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div className="h-8 bg-slate-200 dark:bg-white/10 rounded w-36" />
        </div>
      </div>
    );
  }

  const isFeatured = variant === 'featured';

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200',
        'font-body shadow-sm hover:shadow-md',
        onClick && 'cursor-pointer hover:-translate-y-0.5',
        isFeatured
          ? 'bg-gradient-to-br from-brand-navy to-slate-900 text-white border-brand-navy/50'
          : 'bg-white dark:bg-[#161E33] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white',
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'text-xs font-semibold uppercase tracking-wider',
              isFeatured ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
            )}
          >
            {title}
          </span>

          <div className="flex items-center gap-2">
            {badgeText && (
              <Badge variant={badgeVariant} size="xs">
                {badgeText}
              </Badge>
            )}
            {icon && (
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105',
                  activeIconBg
                )}
              >
                <Icon icon={icon} className="text-lg" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2 flex-wrap">
          <span
            className={cn(
              'font-title text-2xl sm:text-3xl font-bold tracking-tight',
              isFeatured ? 'text-white' : 'text-slate-900 dark:text-white'
            )}
          >
            {value}
          </span>

          {change && (
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border',
                  isPositive
                    ? 'text-brand-green bg-brand-green/10 border-brand-green/20 dark:bg-brand-green/20'
                    : 'text-rose-600 bg-rose-500/10 border-rose-500/20 dark:text-rose-400 dark:bg-rose-500/20'
                )}
              >
                <Icon
                  icon={isPositive ? 'solar:arrow-up-linear' : 'solar:arrow-down-linear'}
                  className="text-xs stroke-2"
                />
                <span>{change}</span>
              </div>
              {period && (
                <span
                  className={cn(
                    'text-[10px] hidden sm:inline',
                    isFeatured ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500'
                  )}
                >
                  {period}
                </span>
              )}
            </div>
          )}
        </div>

        {subtitle && (
          <p
            className={cn(
              'mt-1 text-xs',
              isFeatured ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
            )}
          >
            {subtitle}
          </p>
        )}
      </div>

      {progress !== undefined && (
        <div className="mt-4 pt-2 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Progression</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-orange rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default KpiCard;
