import React, { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

export function Table({ children, className, ...props }: React.HTMLAttributes<HTMLTableElement> & { children: ReactNode; className?: string }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full text-sm text-left', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement> & { children: ReactNode; className?: string }) {
  return (
    <thead className={cn('border-b border-[var(--color-border)] bg-[var(--color-bg)]', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement> & { children: ReactNode; className?: string }) {
  return (
    <tbody className={cn('divide-y divide-[var(--color-border)]', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement> & { children: ReactNode; className?: string }) {
  return (
    <tr className={cn('hover:bg-[var(--color-bg)] transition-colors', className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHeader({ children, className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement> & { children: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement> & { children: ReactNode; className?: string }) {
  return (
    <td className={cn('px-4 py-3 text-[var(--color-text)]', className)} {...props}>
      {children}
    </td>
  );
}
