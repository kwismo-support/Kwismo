import { cn } from '@/shared/lib/utils';

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-[var(--color-border)]',
        className,
      )}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton de chargement générique pour les pages.
 */
export function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-6" aria-busy="true" aria-label="Chargement…">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

export { Skeleton };
