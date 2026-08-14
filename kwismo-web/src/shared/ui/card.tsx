import { cn } from '@/shared/lib/utils';

interface CardProps {
  children:   React.ReactNode;
  className?: string;
  padding?:   'none' | 'sm' | 'md' | 'lg';
}

const paddings = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-8' };

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] shadow-sm',
        paddings[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4 flex items-center justify-between', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn('text-lg font-semibold text-[var(--color-text)]', className)}>{children}</h2>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn(className)}>{children}</div>;
}
