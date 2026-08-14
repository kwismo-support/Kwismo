import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';

interface ErrorStateProps {
  message?:   string;
  onRetry?:   () => void;
  className?: string;
}

export function ErrorState({
  message   = 'Une erreur est survenue.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-center',
        className,
      )}
    >
      <AlertCircle size={40} className="text-red-500" />
      <p className="text-sm text-[var(--color-text-muted)]">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw size={14} />
          Réessayer
        </Button>
      )}
    </div>
  );
}
