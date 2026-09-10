import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useToastStore, type ToastMessage, type ToastType } from '@/shared/store/toastStore';
import { cn } from '@/shared/lib/utils';

const toastConfig: Record<ToastType, { icon: string; bg: string; border: string; text: string }> = {
  success: {
    icon: 'solar:check-circle-bold',
    bg: 'bg-emerald-50 dark:bg-emerald-950/80',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-800 dark:text-emerald-200',
  },
  error: {
    icon: 'solar:close-circle-bold',
    bg: 'bg-rose-50 dark:bg-rose-950/80',
    border: 'border-rose-200 dark:border-rose-800',
    text: 'text-rose-800 dark:text-rose-200',
  },
  warning: {
    icon: 'solar:danger-triangle-bold',
    bg: 'bg-amber-50 dark:bg-amber-950/80',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-800 dark:text-amber-200',
  },
  info: {
    icon: 'solar:info-circle-bold',
    bg: 'bg-blue-50 dark:bg-blue-950/80',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
  },
};

export function ToastItem({ toast }: { toast: ToastMessage }) {
  const { t, i18n } = useTranslation();
  const removeToast = useToastStore((s) => s.removeToast);
  const [visible, setVisible] = useState(true);
  const config = toastConfig[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => removeToast(toast.id), 250);
    }, toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast, removeToast]);

  const formatText = (text?: string) => {
    if (!text) return '';
    if (i18n.exists(text)) return t(text);

    if (text.includes('.')) {
      const parts = text.split('.');
      const nsKey = `${parts[0]}:${parts.slice(1).join('.')}`;
      if (i18n.exists(nsKey)) return t(nsKey);
    }

    if (text.includes(':')) {
      const dotKey = text.replace(':', '.');
      if (i18n.exists(dotKey)) return t(dotKey);
    }

    return text;
  };

  const titleText = formatText(toast.title);
  const messageText = formatText(toast.message);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-200 font-body',
        config.bg,
        config.border,
        config.text,
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95',
      )}
    >
      <Icon icon={config.icon} className="text-xl shrink-0 mt-0.5" />

      <div className="flex-1 min-w-0">
        {titleText && <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5">{titleText}</h4>}
        <p className="text-xs leading-relaxed font-medium">{messageText}</p>
      </div>

      <button
        onClick={() => removeToast(toast.id)}
        aria-label="Fermer"
        className="opacity-70 hover:opacity-100 transition-opacity"
      >
        <Icon icon="solar:close-circle-bold" className="text-lg" />
      </button>
    </div>
  );
}


export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 w-full max-w-sm px-4 pointer-events-auto"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
