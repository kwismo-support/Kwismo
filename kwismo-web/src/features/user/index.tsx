import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { api } from '@/shared/lib/api';
import { toast } from '@/shared/store/toastStore';
import { PhoneInput } from '@/shared/ui/phone-input';
import type { NumeroDTO } from '@/shared/mock';

export default function UserPortalPage() {
  const { t } = useTranslation(['user', 'admin', 'common']);
  const [activeTab, setActiveTab] = useState<'home' | 'verify' | 'report' | 'compromised' | 'numbers' | 'profile'>('home');
  const [searchPhone, setSearchPhone] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [searchResult, setSearchResult] = useState<NumeroDTO | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [compromisedOpen, setCompromisedOpen] = useState(false);
  const [compromisedPhone, setCompromisedPhone] = useState('');
  const [isCompromisedValid, setIsCompromisedValid] = useState(false);
  const [compromisedType, setCompromisedType] = useState('stolen');
  const [compromisedSuccess, setCompromisedSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone.trim() || !isPhoneValid) {
      toast.error(t('errors:validation.invalidPhone'));
      return;
    }
    setIsVerifying(true);
    try {
      const res = await api.verifyNumber(searchPhone.trim());
      setSearchResult(res);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCompromisedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compromisedPhone.trim() || !isCompromisedValid) {
      toast.error(t('errors:validation.invalidPhone'));
      return;
    }
    setCompromisedSuccess(true);
    toast.success(t('user:compromisedSuccess.title'));
    setTimeout(() => {
      setCompromisedSuccess(false);
      setCompromisedOpen(false);
      setCompromisedPhone('');
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 font-body max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-title text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {t('user:title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('user:subtitle')}
          </p>
        </div>

        <button
          onClick={() => setCompromisedOpen(true)}
          className="flex items-center justify-center gap-2 h-11 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-600/20 transition active:scale-[0.98]"
        >
          <Icon icon="solar:shield-warning-bold" className="text-lg" />
          <span>{t('user:compromisedModal.title')}</span>
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10">
        {[
          { id: 'home', label: t('user:nav.home'), icon: 'solar:widget-bold-duotone' },
          { id: 'verify', label: t('user:nav.verify'), icon: 'solar:magnifer-bold-duotone' },
          { id: 'report', label: t('user:nav.report'), icon: 'solar:danger-triangle-bold-duotone' },
          { id: 'numbers', label: t('user:nav.numbers'), icon: 'solar:phone-bold-duotone' },
          { id: 'profile', label: t('user:nav.profile'), icon: 'solar:user-bold-duotone' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-brand-green text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Icon icon={tab.icon} className="text-lg" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'home' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white dark:bg-brand-navy p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green">
                  <Icon icon="solar:magnifer-bold-duotone" className="text-xl" />
                </div>
                <div>
                  <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
                    {t('user:quickVerify.title')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('user:quickVerify.subtitle')}
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerify} className="mt-4 flex flex-col sm:flex-row items-end gap-3">
                <PhoneInput
                  value={searchPhone}
                  onChange={(val, valid) => {
                    setSearchPhone(val);
                    setIsPhoneValid(valid);
                  }}
                  className="flex-1"
                />
                <button
                  type="submit"
                  disabled={isVerifying || !isPhoneValid}
                  className="h-11 px-6 rounded-xl bg-brand-green text-white font-semibold text-sm hover:bg-brand-green/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Icon icon="solar:shield-check-bold" className="text-lg" />
                  <span>{isVerifying ? t('common:loading') : t('user:quickVerify.verify')}</span>
                </button>
              </form>

              {searchResult && (
                <div className={`mt-6 p-4 rounded-2xl border flex items-start gap-4 ${
                  searchResult.statut === 'frauduleux'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                    : searchResult.statut === 'a_signaler'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                }`}>
                  <Icon
                    icon={searchResult.statut === 'frauduleux' ? 'solar:danger-triangle-bold' : searchResult.statut === 'a_signaler' ? 'solar:shield-warning-bold' : 'solar:shield-check-bold'}
                    className="text-2xl shrink-0 mt-0.5"
                  />
                  <div>
                    <h4 className="font-bold text-sm">
                      {t(`admin:numbers.status.${searchResult.statut}`)}
                    </h4>
                    <p className="text-xs mt-1 font-medium">{searchResult.valeur} ({searchResult.operatorName})</p>
                    <p className="text-[11px] opacity-80 mt-0.5">{t('user:quickVerify.riskScore')} : {searchResult.scoreRisque} / 100</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-600 to-rose-700 text-white p-6 rounded-3xl shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 backdrop-blur-md">
                <Icon icon="solar:shield-warning-bold" className="text-2xl text-white" />
              </div>
              <h3 className="font-title text-xl font-bold">{t('user:emergency.title')}</h3>
              <p className="text-xs text-white/80 mt-2 leading-relaxed">
                {t('user:emergency.subtitle')}
              </p>
            </div>

            <button
              onClick={() => setCompromisedOpen(true)}
              className="mt-6 w-full h-11 bg-white text-rose-700 rounded-xl font-bold text-xs shadow hover:bg-slate-100 transition flex items-center justify-center gap-2"
            >
              <Icon icon="solar:siren-bold" className="text-lg" />
              <span>{t('user:emergency.button')}</span>
            </button>
          </div>
        </div>
      )}

      {compromisedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white dark:bg-brand-navy rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                  <Icon icon="solar:shield-warning-bold" className="text-xl" />
                </div>
                <div>
                  <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
                    {t('user:compromisedModal.title')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('user:compromisedModal.subtitle')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCompromisedOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <Icon icon="solar:close-circle-bold" className="text-2xl" />
              </button>
            </div>

            {compromisedSuccess ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center text-emerald-600 dark:text-emerald-400">
                <Icon icon="solar:check-circle-bold" className="text-4xl mx-auto mb-2" />
                <h4 className="font-bold text-base">{t('user:compromisedSuccess.title')}</h4>
                <p className="text-xs mt-1">{t('user:compromisedSuccess.subtitle')}</p>
              </div>
            ) : (
              <form onSubmit={handleCompromisedSubmit} className="flex flex-col gap-4">
                <PhoneInput
                  label={t('user:compromisedModal.phoneLabel')}
                  required
                  value={compromisedPhone}
                  onChange={(val, valid) => {
                    setCompromisedPhone(val);
                    setIsCompromisedValid(valid);
                  }}
                />

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    {t('user:compromisedModal.reasonLabel')}
                  </label>
                  <select
                    value={compromisedType}
                    onChange={(e) => setCompromisedType(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-darkBg text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-rose-500"
                  >
                    <option value="stolen">{t('user:compromisedModal.reasons.stolen')}</option>
                    <option value="sim_swap">{t('user:compromisedModal.reasons.sim_swap')}</option>
                    <option value="whatsapp_hack">{t('user:compromisedModal.reasons.whatsapp_hack')}</option>
                    <option value="other">{t('user:compromisedModal.reasons.other')}</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setCompromisedOpen(false)}
                    className="flex-1 h-11 rounded-xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                  >
                    {t('user:compromisedModal.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={!isCompromisedValid}
                    className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow disabled:opacity-50"
                  >
                    {t('user:compromisedModal.submit')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
