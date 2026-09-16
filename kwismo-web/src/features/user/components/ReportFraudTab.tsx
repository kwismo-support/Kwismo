import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { PhoneInput } from '@/shared/ui/phone-input';
import { userApi } from '../services/user.api';
import { Button } from '@/shared/ui/button';

export function ReportFraudTab() {
  const { t } = useTranslation(['user', 'common']);
  const [suspectPhone, setSuspectPhone] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [typeFraude, setTypeFraude] = useState('phishing');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !suspectPhone || !description.trim()) return;
    setLoading(true);
    try {
      await userApi.reportFraud({
        telephone_suspect: suspectPhone,
        type_fraude: typeFraude,
        description: description.trim(),
      });
      setSuspectPhone('');
      setDescription('');
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
            <Icon icon="solar:danger-triangle-bold-duotone" className="text-xl text-rose-600 dark:text-rose-400" />
            <span>{t('user:reportTab.title')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('user:reportTab.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <PhoneInput
            value={suspectPhone}
            onChange={(val, valid) => {
              setSuspectPhone(val);
              setIsValid(valid);
            }}
            label={t('user:reportTab.suspectPhoneLabel')}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('user:reportTab.fraudTypeLabel')}
            </label>
            <select
              value={typeFraude}
              onChange={(e) => setTypeFraude(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-navy text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-rose-500 transition"
            >
              <option value="phishing">{t('user:reportTab.types.phishing')}</option>
              <option value="scam_call">{t('user:reportTab.types.scamCall')}</option>
              <option value="impersonation">{t('user:reportTab.types.impersonation')}</option>
              <option value="spam">{t('user:reportTab.types.spam')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('user:reportTab.descLabel')}
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('user:reportTab.descPlaceholder')}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-navy text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-rose-500 transition resize-none"
            />
          </div>

          <Button
            type="submit"
            variant="danger"
            size="md"
            fullWidth
            isLoading={loading}
            disabled={!isValid || !suspectPhone || !description.trim()}
            leftIcon="solar:shield-warning-bold"
          >
            {t('user:reportTab.submitBtn')}
          </Button>
        </form>
      </div>
    </div>
  );
}
