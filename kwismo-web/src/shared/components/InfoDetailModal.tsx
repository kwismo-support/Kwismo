import React from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/shared/lib/utils';

export interface InfoItem {
  label: string;
  value: React.ReactNode;
  icon?: string;
  badge?: React.ReactNode;
}

export interface InfoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: string;
  badge?: React.ReactNode;
  items: InfoItem[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function InfoDetailModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon = 'solar:info-circle-bold-duotone',
  badge,
  items = [],
  actions,
  children,
}: InfoDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-body">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className={cn(
            'relative w-full max-w-xl overflow-hidden rounded-2xl bg-white dark:bg-brand-navy p-6 shadow-2xl',
            'border border-slate-200 dark:border-white/10 text-left animate-in zoom-in-95 duration-200'
          )}
        >
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy/10 dark:bg-white/10 text-brand-orange text-xl">
                <Icon icon={icon} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
                    {title}
                  </h3>
                  {badge}
                </div>
                {subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              <Icon icon="solar:close-circle-bold" className="text-lg" />
            </button>
          </div>

          <div className="my-6 space-y-4">
            {items.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-brand-darkBg/60 border border-slate-200/60 dark:border-white/5"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
                      {item.icon && <Icon icon={item.icon} className="text-brand-orange text-sm" />}
                      <span>{item.label}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {children}
          </div>

          {actions && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
