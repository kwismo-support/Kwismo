import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/ui/button';
import NumberStatusBadge from './NumberStatusBadge';
import type { NumeroDTO } from '@/shared/mock';

interface NumberHistoryModalProps {
  numero: NumeroDTO | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NumberHistoryModal({ numero, isOpen, onClose }: NumberHistoryModalProps) {
  const { t } = useTranslation(['admin', 'common']);

  if (!isOpen || !numero) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-body animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-[#161E33] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green">
              <Icon icon="solar:phone-bold-duotone" className="text-xl" />
            </div>
            <div>
              <h3 className="font-title text-base font-bold text-slate-900 dark:text-white font-mono">
                {numero.valeur}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {numero.operatorName} ({numero.countryCode})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <Icon icon="solar:close-circle-linear" className="text-2xl" />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-5">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#0F1626] border border-slate-200 dark:border-white/5">
            <div>
              <span className="text-xs text-slate-500 block mb-1">{t('admin:numbers.riskScore')}</span>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      numero.scoreRisque >= 80 ? 'bg-rose-500' : numero.scoreRisque >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${numero.scoreRisque}%` }}
                  />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                  {numero.scoreRisque} / 100
                </span>
              </div>
            </div>
            <NumberStatusBadge status={numero.statut} />
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              {t('admin:numbers.reportCount')} ({numero.reportsCount})
            </h4>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              <div className="p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:danger-triangle-bold" className="text-amber-500 text-sm" />
                  <span>Tentative d'usurpation d'identité (Vishing)</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(numero.dateDerniereVerification).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('common:close')}
          </Button>
        </div>
      </div>
    </div>
  );
}
