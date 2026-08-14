import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full text-sm text-left', className)}>{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[var(--color-border)]">{children}</tbody>;
}

export function TableRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr className={cn('hover:bg-[var(--color-bg)] transition-colors', className)}>
      {children}
    </tr>
  );
}

export function TableHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn('px-4 py-3 text-[var(--color-text)]', className)}>{children}</td>
  );
}
