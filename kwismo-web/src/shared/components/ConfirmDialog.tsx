import { Icon } from '@iconify/react';
import { cn } from '@/shared/lib/utils';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
  confirmTextMatch?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantConfig = {
    danger: {
      icon: 'solar:danger-triangle-bold-duotone',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/20',
      button: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    warning: {
      icon: 'solar:amber-warning-bold-duotone',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    info: {
      icon: 'solar:info-square-bold-duotone',
      iconBg: 'bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20 border-brand-blue/20',
      button: 'bg-brand-navy hover:bg-slate-800 text-white dark:bg-brand-orange dark:text-brand-navy',
    },
    success: {
      icon: 'solar:check-circle-bold-duotone',
      iconBg: 'bg-brand-green/10 text-brand-green dark:bg-brand-green/20 border-brand-green/20',
      button: 'bg-brand-green hover:bg-emerald-600 text-white',
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-body">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className={cn(
            'relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-brand-navy p-6 shadow-2xl',
            'border border-slate-200 dark:border-white/10 text-left animate-in zoom-in-95 duration-200'
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl',
                variantConfig.iconBg
              )}
            >
              <Icon icon={variantConfig.icon} />
            </div>

            <div className="flex-1">
              <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition"
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition disabled:opacity-50',
                variantConfig.button
              )}
            >
              {isLoading ? (
                <Icon icon="solar:spinner-bold" className="animate-spin text-base" />
              ) : (
                <Icon icon="solar:check-read-bold" className="text-base" />
              )}
              <span>{confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
