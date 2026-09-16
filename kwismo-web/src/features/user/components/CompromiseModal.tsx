import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/ui/button';

interface CompromiseModalProps {
  isOpen: boolean;
  phoneValue?: string;
  onClose: () => void;
  onDeclare: (typeIncident: string, description: string) => Promise<void>;
  loading?: boolean;
}

export function CompromiseModal({
  isOpen,
  phoneValue,
  onClose,
  onDeclare,
  loading = false,
}: CompromiseModalProps) {
  const { t } = useTranslation(['user', 'common']);
  const [typeIncident, setTypeIncident] = useState('sim_swap');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    await onDeclare(typeIncident, description.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 font-body">
      <div className="w-full max-w-md bg-white dark:bg-brand-navy rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Icon icon="solar:shield-warning-bold-duotone" className="text-xl" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('user:compromisedModal.title')}
              </h2>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                {phoneValue}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition"
          >
            <Icon icon="solar:close-circle-bold" className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('user:compromisedModal.typeLabel')}
            </label>
            <select
              value={typeIncident}
              onChange={(e) => setTypeIncident(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-navy text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-rose-500 transition"
            >
              <option value="sim_swap">{t('user:compromisedModal.types.simSwap')}</option>
              <option value="stolen_phone">{t('user:compromisedModal.types.stolenPhone')}</option>
              <option value="phishing">{t('user:compromisedModal.types.phishing')}</option>
              <option value="identity_theft">{t('user:compromisedModal.types.identityTheft')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('user:compromisedModal.descLabel')}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('user:compromisedModal.descPlaceholder')}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-navy text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-rose-500 transition resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              onClick={onClose}
              disabled={loading}
            >
              {t('common:actions.cancel')}
            </Button>

            <Button
              type="submit"
              variant="danger"
              size="md"
              fullWidth
              isLoading={loading}
              disabled={!description.trim()}
            >
              {t('common:actions.confirm')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
