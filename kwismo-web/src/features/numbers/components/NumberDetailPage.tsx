import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { PageHeader, StatusBadge } from '@/shared/components';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { CountrySelect } from '@/shared/ui/country-select';
import { PhoneInput } from '@/shared/ui/phone-input';
import { FormSkeleton } from '@/shared/ui/skeleton';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { toast } from '@/shared/store/toastStore';
import { numbersApi, type NumberItem } from '../services/numbers.api';
import { usePermissions } from '@/shared/hooks/usePermissions';

export default function NumberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['admin', 'common']);
  const { hasPermission } = usePermissions();
  const [numberData, setNumberData] = useState<NumberItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const [initialData, setInitialData] = useState({
    valeur: '',
    countryCode: 'CM',
    operatorName: 'MTN',
    statut: 'securise',
    scoreRisque: 100,
    noteInvestigatrice: '',
  });

  const [formData, setFormData] = useState({ ...initialData });

  useEffect(() => {
    let mounted = true;
    if (id === 'new') {
      const emptyState = {
        valeur: '',
        countryCode: 'CM',
        operatorName: 'MTN',
        statut: 'securise',
        scoreRisque: 100,
        noteInvestigatrice: '',
      };
      setNumberData({
        id: 'new',
        valeur: '',
        score_risque: 1.0,
        statut: 'securise',
        country_id: 'CM',
        operator_id: 'MTN',
      });
      setIsEditing(true);
      setInitialData(emptyState);
      setFormData(emptyState);
      setLoading(false);
      return;
    }

    if (id) {
      numbersApi
        .getNumberById(id)
        .then((found) => {
          if (!mounted) return;
          if (found) {
            setNumberData(found);
            const scorePct = Math.round(found.score_risque <= 1 ? found.score_risque * 100 : found.score_risque);
            const state = {
              valeur: found.valeur || '',
              countryCode: found.country_id || 'CM',
              operatorName: found.operator_id || 'MTN',
              statut: found.statut || 'securise',
              scoreRisque: scorePct,
              noteInvestigatrice: '',
            };
            setInitialData(state);
            setFormData(state);
          }
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 font-body">
        <FormSkeleton />
      </div>
    );
  }

  if (!numberData) {
    return (
      <div className="p-6 font-body text-center py-12">
        <Icon icon="solar:hashtag-square-bold-duotone" className="text-5xl text-slate-400 mx-auto mb-3" />
        <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
          {t('admin:numbers.notFoundTitle')}
        </h3>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/app/numbers')}>
          {t('admin:numbers.backToList')}
        </Button>
      </div>
    );
  }

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleSave = async () => {
    if (id === 'new') {
      try {
        const created = await numbersApi.verifyNumber(formData.valeur, formData.countryCode);
        toast.success(t('admin:numbers.toasts.verifySuccess'));
        navigate(`/app/numbers/${created.id}`);
      } catch {
        toast.error(t('admin:numbers.toasts.verifyError'));
      }
      return;
    }

    try {
      await numbersApi.setNumberStatus(id!, formData.statut, true);
      setNumberData((prev) => (prev ? { ...prev, statut: formData.statut, score_risque: formData.scoreRisque } : null));
      setInitialData({ ...formData });
      setIsEditing(false);
      toast.success(t('admin:numbers.toasts.statusSuccess'));
    } catch {
      toast.error(t('admin:numbers.toasts.statusError'));
    }
  };

  const handleBack = () => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      navigate('/app/numbers');
    }
  };

  const handleConfirmDiscard = () => {
    setShowUnsavedModal(false);
    navigate('/app/numbers');
  };

  const handleConfirmSaveAndLeave = async () => {
    await handleSave();
    setShowUnsavedModal(false);
    navigate('/app/numbers');
  };

  const riskScore = formData.scoreRisque;
  const isHighRisk = riskScore <= 40 || formData.statut === 'frauduleux';
  const isMediumRisk = (riskScore > 40 && riskScore < 80) || formData.statut === 'a_signaler';

  return (
    <div className="flex flex-col gap-6 p-6 font-body max-w-6xl mx-auto">
      <PageHeader
        title={`${t('admin:numbers.detailTitle')} — ${numberData.valeur || t('admin:numbers.newTitle')}`}
        subtitle={t('admin:numbers.detailSubtitle')}
        showBreadcrumb={false}
        showBack={true}
        onBack={handleBack}
        actions={
          hasPermission('numbers:update')
            ? [
                !isEditing
                  ? {
                      label: t('common:actions.edit'),
                      icon: 'solar:pen-bold',
                      variant: 'primary',
                      onClick: () => setIsEditing(true),
                    }
                  : {
                      label: t('common:actions.save'),
                      icon: 'solar:diskette-bold',
                      variant: 'primary',
                      disabled: !isDirty,
                      onClick: handleSave,
                    },
              ]
            : []
        }
      />

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/10 text-brand-navy dark:text-white font-mono font-bold text-2xl border border-brand-navy/20">
            #
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-mono text-2xl font-bold text-slate-900 dark:text-white tracking-wider">
                {numberData.valeur || 'N/A'}
              </h2>
              <StatusBadge status={numberData.statut} size="sm" />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {t('admin:ussd.operators')}:{' '}
              <span className="font-bold text-slate-900 dark:text-white">
                {numberData.operator_id || 'MTN'}
              </span>
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F1626] border border-slate-200 dark:border-white/10 flex items-center gap-4 min-w-[240px]">
          <div className="relative flex items-center justify-center">
            <div className="h-14 w-14 rounded-full border-4 border-slate-200 dark:border-white/10 flex items-center justify-center">
              <span
                className={`font-title font-bold text-base ${
                  isHighRisk ? 'text-red-500' : isMediumRisk ? 'text-amber-500' : 'text-emerald-500'
                }`}
              >
                {riskScore}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {t('admin:numbers.riskScoreLabel')}
            </p>
            <p className="text-[10px] text-slate-500">
              {isHighRisk
                ? t('admin:numbers.riskCritical')
                : isMediumRisk
                ? t('admin:numbers.riskSuspicious')
                : t('admin:numbers.riskNormal')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon icon="solar:shield-warning-bold-duotone" className="text-brand-orange text-xl" />
            {t('admin:numbers.formSectionTitle')}
          </h3>
          {isEditing && (
            <span className="text-xs font-semibold text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full border border-brand-orange/20 animate-pulse">
              {t('common:editMode')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <PhoneInput
            label={t('admin:numbers.phoneNumber')}
            disabled={!isEditing}
            value={formData.valeur}
            onChange={(val) => setFormData({ ...formData, valeur: val })}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('admin:numbers.countryOrigin')}
            </label>
            <CountrySelect
              disabled={!isEditing}
              value={formData.countryCode}
              onChange={(val) => setFormData({ ...formData, countryCode: val })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('admin:ussd.operators')}
            </label>
            <select
              disabled={!isEditing}
              value={formData.operatorName}
              onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
              className="h-11 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-brand-green disabled:opacity-60 disabled:cursor-not-allowed font-body"
            >
              <option value="MTN">MTN</option>
              <option value="Orange">Orange</option>
              <option value="Airtel">Airtel</option>
              <option value="Moov">Moov</option>
              <option value="Wave">Wave</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('common:status')}
            </label>
            <select
              disabled={!isEditing}
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
              className="h-11 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-brand-green disabled:opacity-60 disabled:cursor-not-allowed font-body"
            >
              <option value="securise">{t('admin:numbers.statusSecured')}</option>
              <option value="a_signaler">{t('admin:numbers.statusWarning')}</option>
              <option value="frauduleux">{t('admin:numbers.statusFraud')}</option>
            </select>
          </div>

          <Input
            label={t('admin:numbers.riskScoreInput')}
            type="number"
            min={0}
            max={100}
            disabled={!isEditing}
            value={formData.scoreRisque}
            onChange={(e) => setFormData({ ...formData, scoreRisque: Number(e.target.value) })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t('admin:numbers.expertNote')}
          </label>
          <textarea
            rows={3}
            disabled={!isEditing}
            value={formData.noteInvestigatrice}
            onChange={(e) => setFormData({ ...formData, noteInvestigatrice: e.target.value })}
            className="p-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-brand-green disabled:opacity-60 disabled:cursor-not-allowed font-body resize-none"
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={showUnsavedModal}
        onClose={handleConfirmDiscard}
        onConfirm={handleConfirmSaveAndLeave}
        title={t('common:unsavedChanges.title')}
        description={t('common:unsavedChanges.desc')}
        confirmLabel={t('common:unsavedChanges.saveAndLeave')}
        cancelLabel={t('common:unsavedChanges.discard')}
        variant="warning"
      />
    </div>
  );
}
