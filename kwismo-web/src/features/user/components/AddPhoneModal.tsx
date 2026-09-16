import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { PhoneInput } from '@/shared/ui/phone-input';
import { Button } from '@/shared/ui/button';

interface AddPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (valeur: string) => Promise<void>;
  loading?: boolean;
}

export function AddPhoneModal({ isOpen, onClose, onAdd, loading = false }: AddPhoneModalProps) {
  const { t } = useTranslation(['user', 'common']);
  const [phoneValue, setPhoneValue] = useState('');
  const [isValid, setIsValid] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !phoneValue) return;
    await onAdd(phoneValue);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 font-body">
      <div className="w-full max-w-md bg-white dark:bg-brand-navy rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center">
              <Icon icon="solar:phone-calling-bold-duotone" className="text-xl" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('user:addPhoneModal.title')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('user:addPhoneModal.subtitle')}
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
          <PhoneInput
            value={phoneValue}
            onChange={(val, valid) => {
              setPhoneValue(val);
              setIsValid(valid);
            }}
            label={t('user:addPhoneModal.phoneLabel')}
            required
          />

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
              variant="primary"
              size="md"
              fullWidth
              isLoading={loading}
              disabled={!isValid || !phoneValue}
            >
              {t('common:actions.add')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
