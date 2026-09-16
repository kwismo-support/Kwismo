import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import type { UserPhone } from '../services/user.api';
import { COUNTRY_LIST } from '@/shared/lib/phone';

interface MyPhonesTabProps {
  phones: UserPhone[];
  loading?: boolean;
  onOpenAddModal: () => void;
  onOpenVerifyModal: (phone: UserPhone) => void;
  onOpenCompromiseModal: (phone: UserPhone) => void;
  onRemovePhone: (phoneId: string) => Promise<void>;
}

export function MyPhonesTab({
  phones,
  loading = false,
  onOpenAddModal,
  onOpenVerifyModal,
  onOpenCompromiseModal,
  onRemovePhone,
}: MyPhonesTabProps) {
  const { t } = useTranslation(['user', 'common']);

  const getCountryIcon = (valeur: string) => {
    const cleanVal = valeur.replace(/^\+/, '');
    const matched = COUNTRY_LIST.find((c) => cleanVal.startsWith(c.dialCode.replace('+', '')));
    return matched ? matched.icon : 'emojione:flag-for-cameroon';
  };

  return (
    <div className="flex flex-col gap-6 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-brand-navy rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon icon="solar:phone-calling-bold-duotone" className="text-xl text-brand-green" />
            <span>{t('user:myPhones.title')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('user:myPhones.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 h-11 px-5 rounded-2xl bg-brand-green hover:bg-brand-green/90 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-brand-green/20 transition active:scale-[0.98]"
        >
          <Icon icon="solar:add-circle-bold" className="text-lg" />
          <span>{t('user:myPhones.addBtn')}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white dark:bg-brand-navy rounded-3xl border border-slate-200 dark:border-white/10">
          <Icon icon="solar:loading-bold" className="text-3xl text-brand-green animate-spin" />
        </div>
      ) : phones.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-brand-navy rounded-3xl border border-slate-200 dark:border-white/10 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center text-2xl">
            <Icon icon="solar:phone-bold-duotone" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            {t('user:myPhones.emptyTitle')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            {t('user:myPhones.emptySubtitle')}
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="mt-2 text-xs font-semibold text-brand-green hover:underline"
          >
            {t('user:myPhones.addBtn')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phones.map((phone) => {
            const flagIcon = getCountryIcon(phone.valeur);
            return (
              <div
                key={phone.id}
                className="bg-white dark:bg-brand-navy p-5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between gap-4 transition hover:border-brand-green/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                      <Icon icon={flagIcon} className="text-2xl" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-mono block">
                        {phone.valeur}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {phone.date_ajout ? new Date(phone.date_ajout).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {phone.compromis ? (
                      <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-bold flex items-center gap-1">
                        <Icon icon="solar:danger-triangle-bold" />
                        <span>{t('user:myPhones.status.compromised')}</span>
                      </span>
                    ) : phone.verifie ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                        <Icon icon="solar:check-circle-bold" />
                        <span>{t('user:myPhones.status.verified')}</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold flex items-center gap-1">
                        <Icon icon="solar:clock-circle-bold" />
                        <span>{t('user:myPhones.status.unverified')}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    {!phone.verifie && (
                      <button
                        type="button"
                        onClick={() => onOpenVerifyModal(phone)}
                        className="px-3 py-1.5 rounded-xl bg-brand-green/10 hover:bg-brand-green/20 text-brand-green font-semibold transition"
                      >
                        {t('common:actions.verify')}
                      </button>
                    )}

                    {phone.verifie && !phone.compromis && (
                      <button
                        type="button"
                        onClick={() => onOpenCompromiseModal(phone)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold transition flex items-center gap-1"
                      >
                        <Icon icon="solar:shield-warning-bold" />
                        <span>{t('user:myPhones.reportCompromise')}</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemovePhone(phone.id)}
                    className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition"
                    title={t('common:actions.delete')}
                  >
                    <Icon icon="solar:trash-bin-trash-bold" className="text-base" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
