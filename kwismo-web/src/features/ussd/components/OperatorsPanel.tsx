import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/ui/button';
import type { OperatorDTO } from '@/shared/mock';

interface OperatorsPanelProps {
  operators: OperatorDTO[];
  isLoading?: boolean;
  onAddOperator?: () => void;
  onSelectOperator?: (op: OperatorDTO) => void;
}

export default function OperatorsPanel({ operators, isLoading = false, onAddOperator, onSelectOperator }: OperatorsPanelProps) {
  const { t } = useTranslation(['admin', 'common']);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm animate-pulse font-body">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-48 mb-2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
            {t('admin:ussd.operators')}
          </h3>
        </div>
        {onAddOperator && (
          <Button size="xs" variant="primary" leftIcon="solar:cellphone-bold" onClick={onAddOperator}>
            {t('admin:ussd.addOperator')}
          </Button>
        )}
      </div>

      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {operators.map((op) => (
          <div
            key={op.id}
            onClick={() => onSelectOperator?.(op)}
            className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] flex items-center justify-between cursor-pointer hover:border-brand-orange transition"
          >
            <div className="flex items-center gap-3">
              <Icon icon="solar:cellphone-linear" className="text-2xl text-brand-orange" />
              <div>
                <h4 className="font-title text-xs font-bold text-slate-900 dark:text-white">{op.nom}</h4>
                <p className="font-mono text-[11px] text-slate-500">{op.countryName}</p>
              </div>
            </div>
            <div className="flex gap-1 flex-wrap justify-end">
              {op.prefixes.slice(0, 3).map((p) => (
                <span key={p} className="px-2 py-0.5 rounded-md bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 font-mono text-[10px]">
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
