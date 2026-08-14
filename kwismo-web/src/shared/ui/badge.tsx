import { cn } from '@/shared/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

interface BadgeProps {
  variant?:  BadgeVariant;
  children:  React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default:  'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300',
  success:  'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  warning:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  danger:   'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  info:     'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  outline:  'border border-[var(--color-border)] text-[var(--color-text-muted)]',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
