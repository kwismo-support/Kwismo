import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface DialogProps {
  open:       boolean;
  onClose:    () => void;
  title?:     string;
  children:   ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) el.showModal();
    else el.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
      className={cn(
        'w-full max-w-lg rounded-lg border border-[var(--color-border)]',
        'bg-[var(--color-bg-subtle)] p-0 shadow-lg backdrop:bg-black/50',
        'open:animate-fade-in',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
        {title && <h2 className="text-base font-semibold text-[var(--color-text)]">{title}</h2>}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="ml-auto rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <div className="px-6 py-4">{children}</div>
    </dialog>
  );
}
