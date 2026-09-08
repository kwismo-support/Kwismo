import React, { useEffect } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/shared/lib/utils';

export interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const widthMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function DetailDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  icon = 'solar:info-square-bold',
  children,
  footerActions,
  width = 'md',
  className,
}: DetailDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-body">
      {}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={cn(
            'w-screen flex flex-col bg-white dark:bg-brand-navy shadow-2xl border-l border-slate-200 dark:border-white/10',
            'animate-in slide-in-from-right duration-300',
            widthMap[width],
            className
          )}
        >
          {}
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-brand-darkBg/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/10 dark:bg-white/10 text-brand-orange text-xl">
                <Icon icon={icon} />
              </div>
              <div>
                <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Fermer"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              <Icon icon="solar:close-circle-bold" className="text-xl" />
            </button>
          </div>

          {}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>

          {}
          {footerActions && (
            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-brand-darkBg/50">
              {footerActions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
