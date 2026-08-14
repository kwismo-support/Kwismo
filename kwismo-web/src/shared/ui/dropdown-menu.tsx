import { useState, useRef, useEffect, type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface DropdownMenuProps {
  trigger:    ReactNode;
  children:   ReactNode;
  align?:     'left' | 'right';
  className?: string;
}

export function DropdownMenu({ trigger, children, align = 'right', className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 mt-1 min-w-[10rem] rounded-lg border border-[var(--color-border)]',
            'bg-[var(--color-bg-subtle)] py-1 shadow-md animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0',
            className,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children:   ReactNode;
  onClick?:   () => void;
  className?: string;
  disabled?:  boolean;
}

export function DropdownItem({ children, onClick, className, disabled }: DropdownItemProps) {
  return (
    <button
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)]',
        'hover:bg-[var(--color-bg)] transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <hr className="my-1 border-[var(--color-border)]" />;
}
