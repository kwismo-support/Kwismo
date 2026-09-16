import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { useUserPortal } from './hooks/useUserPortal';
import { MyPhonesTab } from './components/MyPhonesTab';
import { AddPhoneModal } from './components/AddPhoneModal';
import { VerifyOtpModal } from './components/VerifyOtpModal';
import { CompromiseModal } from './components/CompromiseModal';
import { UserProfileTab } from './components/UserProfileTab';
import { VerifyPublicNumberTab } from './components/VerifyPublicNumberTab';
import { ReportFraudTab } from './components/ReportFraudTab';

export default function UserPortalPage() {
  const { t } = useTranslation(['user', 'admin', 'common']);
  const {
    phones,
    loading,
    activeTab,
    setActiveTab,
    selectedPhone,
    setSelectedPhone,
    isAddModalOpen,
    setIsAddModalOpen,
    isVerifyModalOpen,
    setIsVerifyModalOpen,
    isCompromiseModalOpen,
    setIsCompromiseModalOpen,
    addPhone,
    verifyPhone,
    resendOtp,
    removePhone,
    declareCompromise,
  } = useUserPortal();

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
          type="button"
          onClick={() => setActiveTab('report')}
          className="flex items-center justify-center gap-2 h-11 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-600/20 transition active:scale-[0.98]"
        >
          <Icon icon="solar:shield-warning-bold" className="text-lg" />
          <span>{t('user:nav.report')}</span>
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10">
        {[
          { id: 'numbers', label: t('user:nav.numbers'), icon: 'solar:phone-bold-duotone' },
          { id: 'verify', label: t('user:nav.verify'), icon: 'solar:magnifer-bold-duotone' },
          { id: 'report', label: t('user:nav.report'), icon: 'solar:danger-triangle-bold-duotone' },
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

      {activeTab === 'numbers' && (
        <MyPhonesTab
          phones={phones}
          loading={loading}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenVerifyModal={(phone) => {
            setSelectedPhone(phone);
            setIsVerifyModalOpen(true);
          }}
          onOpenCompromiseModal={(phone) => {
            setSelectedPhone(phone);
            setIsCompromiseModalOpen(true);
          }}
          onRemovePhone={removePhone}
        />
      )}

      {activeTab === 'verify' && <VerifyPublicNumberTab />}

      {activeTab === 'report' && <ReportFraudTab />}

      {activeTab === 'profile' && <UserProfileTab />}

      <AddPhoneModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addPhone}
        loading={loading}
      />

      <VerifyOtpModal
        isOpen={isVerifyModalOpen}
        phoneValue={selectedPhone?.valeur}
        onClose={() => {
          setIsVerifyModalOpen(false);
          setSelectedPhone(null);
        }}
        onVerify={verifyPhone}
        onResend={resendOtp}
        loading={loading}
      />

      <CompromiseModal
        isOpen={isCompromiseModalOpen}
        phoneValue={selectedPhone?.valeur}
        onClose={() => {
          setIsCompromiseModalOpen(false);
          setSelectedPhone(null);
        }}
        onDeclare={declareCompromise}
        loading={loading}
      />
    </div>
  );
}
