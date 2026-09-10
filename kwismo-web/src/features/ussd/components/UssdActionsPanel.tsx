import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import type { UssdActionDTO } from '@/shared/mock';

interface UssdActionsPanelProps {
  actions: UssdActionDTO[];
  isLoading?: boolean;
  onAddAction?: () => void;
}

export default function UssdActionsPanel({ actions, isLoading = false, onAddAction }: UssdActionsPanelProps) {
  const { t } = useTranslation(['admin', 'common']);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm animate-pulse font-body">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-48 mb-2" />
        <div className="flex flex-col gap-3 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm font-body">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
            {t('admin:ussd.actions')}
          </h3>
        </div>
        {onAddAction && (
          <Button size="xs" variant="primary" leftIcon="solar:add-circle-bold" onClick={onAddAction}>
            {t('admin:ussd.addAction')}
          </Button>
        )}
      </div>

      <div className="mt-2 flex flex-col gap-3">
        {actions.map((act) => (
          <div key={act.id} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-title text-xs font-bold text-slate-900 dark:text-white">
                {act.nomAction} ({act.operatorName})
              </h4>
              <p className="font-mono text-xs text-brand-green mt-1">{act.format}</p>
            </div>
            <Button size="xs" variant="ghost" leftIcon="solar:pen-bold" />
          </div>
        ))}
      </div>
    </div>
  );
}
