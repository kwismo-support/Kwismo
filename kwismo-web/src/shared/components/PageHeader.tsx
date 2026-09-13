import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { cn } from '@/shared/lib/utils';

export interface PageHeaderAction {
  label: string;
  onClick: () => void;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rolePerspective?: string;
  actions?: PageHeaderAction[];
  showBreadcrumb?: boolean;
  showBack?: boolean;
  backTo?: string;
  onBack?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions = [],
  showBack = false,
  backTo,
  onBack,
  children,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={cn('flex flex-col gap-4 font-body mb-6', className)}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-start gap-3">
          {showBack && (
            <button
              onClick={handleBackClick}
              aria-label="Retour"
              className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition"
            >
              <Icon icon="solar:alt-arrow-left-bold" className="text-lg" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-title text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h1>
            </div>

            {subtitle && (
              <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions.length > 0 && (
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {actions.map((action, idx) => {
              const isPrimary = action.variant === 'primary' || (!action.variant && idx === actions.length - 1);
              const isDanger = action.variant === 'danger';
              const isOutline = action.variant === 'outline';

              return (
                <button
                  key={action.label + idx}
                  onClick={action.onClick}
                  disabled={action.disabled || action.isLoading}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    isPrimary &&
                      'bg-brand-navy text-white hover:bg-slate-800 dark:bg-brand-orange dark:text-brand-navy dark:hover:bg-brand-orange/90',
                    isDanger &&
                      'bg-rose-600 text-white hover:bg-rose-700',
                    isOutline &&
                      'border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 bg-white dark:bg-brand-navy hover:bg-slate-50 dark:hover:bg-white/5',
                    !isPrimary && !isDanger && !isOutline &&
                      'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/20'
                  )}
                >
                  {action.isLoading ? (
                    <Icon icon="solar:spinner-bold" className="animate-spin text-base" />
                  ) : action.icon ? (
                    <Icon icon={action.icon} className="text-base" />
                  ) : null}
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {children && <div>{children}</div>}
    </div>
  );
}
