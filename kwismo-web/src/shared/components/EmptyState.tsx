import { ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/shared/lib/utils';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string | ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  actionLabel,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 px-4 text-center font-body',
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-brand-orange shadow-xs">
        {icon ? (
          typeof icon === 'string' ? (
            <Icon icon={icon} className="text-3xl" />
          ) : (
            icon
          )
        ) : (
          <Icon icon="solar:box-minimalistic-bold-duotone" className="text-3xl" />
        )}
      </div>

      <div className="max-w-md">
        <p className="font-title text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </p>
        {description && (
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>

      {action ? (
        <div className="mt-3">{action}</div>
      ) : actionLabel && onAction ? (
        <button
          onClick={onAction}
          className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-navy dark:bg-brand-orange text-white dark:text-brand-navy font-semibold text-xs sm:text-sm hover:opacity-95 transition shadow-sm"
        >
          <Icon icon="solar:add-circle-bold" className="text-base" />
          <span>{actionLabel}</span>
        </button>
      ) : null}
    </div>
  );
}
