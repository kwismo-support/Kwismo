import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { PageHeader, StatusBadge } from '@/shared/components';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { FormSkeleton } from '@/shared/ui/skeleton';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { toast } from '@/shared/store/toastStore';
import { partnersApi, type PartnerItem, type AffiliationRule } from '../services/partners.api';
import AffiliationRulesEditor from './AffiliationRulesEditor';
import { usePermissions } from '@/shared/hooks/usePermissions';

export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['admin', 'common']);
  const { hasPermission } = usePermissions();
  const [partner, setPartner] = useState<PartnerItem | null>(null);
  const [rules, setRules] = useState<AffiliationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const [initialData, setInitialData] = useState({
    nom_entreprise: '',
    type_partenariat: 'operateur',
  });

  const [formData, setFormData] = useState({ ...initialData });

  const loadRules = async (partnerId: string) => {
    const fetchedRules = await partnersApi.getAffiliationRules(partnerId);
    setRules(fetchedRules);
  };

  useEffect(() => {
    let mounted = true;
    if (id === 'new') {
      const emptyState = {
        nom_entreprise: '',
        type_partenariat: 'operateur',
      };
      setPartner({
        id: 'new',
        nom_entreprise: '',
        type_partenariat: 'operateur',
        date_adhesion: new Date().toISOString(),
      });
      setIsEditing(true);
      setInitialData(emptyState);
      setFormData(emptyState);
      setLoading(false);
      return;
    }

    if (id) {
      Promise.all([partnersApi.getPartnerById(id), partnersApi.getAffiliationRules(id)])
        .then(([foundPartner, fetchedRules]) => {
          if (!mounted) return;
          if (foundPartner) {
            setPartner(foundPartner);
            setRules(fetchedRules);
            const state = {
              nom_entreprise: foundPartner.nom_entreprise || '',
              type_partenariat: foundPartner.type_partenariat || 'operateur',
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

  if (!partner) {
    return (
      <div className="p-6 font-body text-center py-12">
        <Icon icon="solar:buildings-bold-duotone" className="text-5xl text-slate-400 mx-auto mb-3" />
        <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
          {t('admin:partners.notFoundTitle')}
        </h3>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/app/partners')}>
          {t('admin:partners.backToList')}
        </Button>
      </div>
    );
  }

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleSave = async () => {
    if (id === 'new') {
      try {
        const created = await partnersApi.createPartner(formData);
        toast.success(t('partners.toasts.createSuccess'));
        navigate(`/app/partners/${created.id}`);
      } catch {
        toast.error(t('partners.toasts.createError'));
      }
      return;
    }

    setPartner((prev) => (prev ? { ...prev, ...formData } : null));
    setInitialData({ ...formData });
    setIsEditing(false);
    toast.success(t('partners.toasts.saveSuccess'));
  };

  const handleAddAffiliationRule = async (countryId: string, prefixes: string[]) => {
    if (!id || id === 'new') return;
    try {
      await partnersApi.addAffiliationRule(id, { country_id: countryId, prefixes });
      toast.success(t('partners.toasts.ruleAddSuccess'));
      loadRules(id);
    } catch {
      toast.error(t('partners.toasts.ruleAddError'));
    }
  };

  const handleBack = () => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      navigate('/app/partners');
    }
  };

  const handleConfirmDiscard = () => {
    setShowUnsavedModal(false);
    navigate('/app/partners');
  };

  const handleConfirmSaveAndLeave = async () => {
    await handleSave();
    setShowUnsavedModal(false);
    navigate('/app/partners');
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body max-w-6xl mx-auto">
      <PageHeader
        title={`${t('admin:partners.detailTitle')} — ${partner.nom_entreprise || t('admin:partners.newTitle')}`}
        subtitle={t('admin:partners.detailSubtitle')}
        showBreadcrumb={false}
        showBack={true}
        onBack={handleBack}
        actions={
          hasPermission('partners:update')
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
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange font-title font-bold text-2xl border border-brand-orange/20">
            {(partner.nom_entreprise || 'PA').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-title text-xl font-bold text-slate-900 dark:text-white">
                {partner.nom_entreprise || 'N/A'}
              </h2>
              <StatusBadge status={partner.type_partenariat} size="sm" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {t('admin:partners.adhesionDate')}:{' '}
              {partner.date_adhesion
                ? new Date(partner.date_adhesion).toLocaleDateString()
                : '—'}
            </p>
          </div>
        </div>

        {partner.kpi && (
          <div className="flex items-center gap-6 bg-slate-50 dark:bg-[#0F1626] p-4 rounded-2xl border border-slate-200 dark:border-white/10">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">{t('admin:partners.scopeNumbers')}</p>
              <p className="font-title text-lg font-bold text-slate-900 dark:text-white">
                {partner.kpi.numeros_affilies}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">{t('admin:partners.scopeFraudRate')}</p>
              <p className="font-title text-lg font-bold text-brand-orange">
                {Math.round(partner.kpi.taux_fraude_perimetre * 100)}%
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon icon="solar:buildings-bold-duotone" className="text-brand-orange text-xl" />
            {t('admin:partners.formSectionTitle')}
          </h3>
          {isEditing && (
            <span className="text-xs font-semibold text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full border border-brand-orange/20 animate-pulse">
              {t('common:editMode')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label={t('admin:partners.name')}
            disabled={!isEditing}
            value={formData.nom_entreprise}
            onChange={(e) => setFormData({ ...formData, nom_entreprise: e.target.value })}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('admin:partners.type')}
            </label>
            <select
              disabled={!isEditing}
              value={formData.type_partenariat}
              onChange={(e) => setFormData({ ...formData, type_partenariat: e.target.value })}
              className="h-11 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-brand-green disabled:opacity-60 disabled:cursor-not-allowed font-body"
            >
              <option value="operateur">{t('admin:partners.filters.telco')}</option>
              <option value="banque">{t('admin:partners.filters.bank')}</option>
              <option value="fintech">{t('admin:partners.filters.fintech')}</option>
            </select>
          </div>
        </div>
      </div>

      {id !== 'new' && (
        <AffiliationRulesEditor
          rules={rules}
          onAddRule={handleAddAffiliationRule}
          disabled={!hasPermission('affiliation:create')}
        />
      )}

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
