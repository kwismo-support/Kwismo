import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { PhoneInput } from '@/shared/ui/phone-input';
import { userApi } from '../services/user.api';
import { Button } from '@/shared/ui/button';

export function VerifyPublicNumberTab() {
  const { t } = useTranslation(['user', 'common']);
  const [phoneValue, setPhoneValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !phoneValue) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await userApi.verifyPublicNumber(phoneValue);
      setResult(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 font-body">
      <div className="bg-white dark:bg-brand-navy p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon icon="solar:magnifer-bold-duotone" className="text-xl text-brand-green" />
            <span>{t('user:verifyTab.title')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('user:verifyTab.subtitle')}
          </p>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <PhoneInput
            value={phoneValue}
            onChange={(val, valid) => {
              setPhoneValue(val);
              setIsValid(valid);
            }}
            label={t('user:verifyTab.phoneLabel')}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            isLoading={loading}
            disabled={!isValid || !phoneValue}
            leftIcon="solar:magnifer-bold"
          >
            {t('common:actions.verify')}
          </Button>
        </form>

        {result && (
          <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center text-xl font-bold font-mono">
                  #
                </div>
                <div>
                  <span className="text-base font-bold text-slate-900 dark:text-white font-mono block">
                    {result.valeur}
                  </span>
                  <span className="text-xs text-slate-400">
                    {result.op?.nomMatricule || 'Operateur GSM'}
                  </span>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                result.statut === 'verified'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}>
                {result.statut}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">{t('user:verifyTab.trustScore')}</span>
                <span className="text-sm font-bold text-brand-green font-mono">
                  {result.scoreConfiance ?? 90}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('user:verifyTab.operator')}</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">
                  {result.op?.nomMatricule || 'CAMTEL / MTN / Orange'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
