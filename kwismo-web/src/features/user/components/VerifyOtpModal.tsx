import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';

interface VerifyOtpModalProps {
  isOpen: boolean;
  phoneValue?: string;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
  onResend: (channel?: 'sms' | 'email') => Promise<void>;
  loading?: boolean;
}

export function VerifyOtpModal({
  isOpen,
  phoneValue,
  onClose,
  onVerify,
  onResend,
  loading = false,
}: VerifyOtpModalProps) {
  const { t } = useTranslation(['user', 'common']);
  const [code, setCode] = useState('');
  const [resending, setResending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    await onVerify(code.trim());
  };

  const handleResendClick = async (channel: 'sms' | 'email' = 'sms') => {
    setResending(true);
    try {
      await onResend(channel);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 font-body">
      <div className="w-full max-w-md bg-white dark:bg-brand-navy rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center">
              <Icon icon="solar:key-minimalistic-bold-duotone" className="text-xl" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('user:verifyOtpModal.title')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
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
          <Input
            type="text"
            label={t('user:verifyOtpModal.codeLabel')}
            placeholder="123456"
            leftIcon="solar:shield-keyhole-bold"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <div className="flex flex-col gap-2 pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t('user:verifyOtpModal.notReceived')}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleResendClick('sms')}
                disabled={resending || loading}
                className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50 flex items-center justify-center gap-1.5 transition"
              >
                <Icon icon="solar:chat-round-dots-bold" className="text-brand-orange text-sm" />
                Renvoyer SMS
              </button>
              <button
                type="button"
                onClick={() => handleResendClick('email')}
                disabled={resending || loading}
                className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl border border-brand-green/30 bg-brand-green/5 text-brand-green hover:bg-brand-green/10 disabled:opacity-50 flex items-center justify-center gap-1.5 transition"
              >
                <Icon icon="solar:letter-bold" className="text-sm" />
                Recevoir par e-mail
              </button>
            </div>
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
              variant="primary"
              size="md"
              fullWidth
              isLoading={loading}
              disabled={!code.trim()}
            >
              {t('common:actions.verify')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
