import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id:      string;
  type:    ToastType;
  message: string;
  duration?: number;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle  size={18} className="text-green-500" />,
  error:   <XCircle      size={18} className="text-red-500"   />,
  warning: <AlertTriangle size={18} className="text-yellow-500" />,
  info:    <Info          size={18} className="text-blue-500"  />,
};

interface ToastItemProps {
  toast:     ToastData;
  onRemove:  (id: string) => void;
}

export function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-center gap-3 rounded-lg border border-[var(--color-border)]',
        'bg-[var(--color-bg-subtle)] px-4 py-3 shadow-md text-sm',
        'transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
      )}
    >
      {icons[toast.type]}
      <span className="flex-1 text-[var(--color-text)]">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Fermer"
        className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts:   ToastData[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-80"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}
