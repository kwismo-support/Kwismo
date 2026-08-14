import { Inbox } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title:       string;
  description?: string;
  action?:     ReactNode;
  icon?:       ReactNode;
  className?:  string;
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-center',
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-bg)] text-[var(--color-text-muted)]">
        {icon ?? <Inbox size={28} />}
      </div>
      <div>
        <p className="font-semibold text-[var(--color-text)]">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
