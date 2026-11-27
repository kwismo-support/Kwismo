import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { PageHeader, KpiCard } from '@/shared/components';
import { Badge } from '@/shared/ui/badge';
import { toast } from '@/shared/store/toastStore';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { plansApi, SubscriptionPlanItem, SubscriptionPlanInput } from './services/plans.api';
import { PlanFormModal } from './components/PlanFormModal';

export default function PlansManagementPage() {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const { isSuperAdmin, isAdmin } = usePermissions();

  const [plans, setPlans] = useState<SubscriptionPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanItem | null>(null);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlanItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await plansApi.getAllPlansAdmin();
      setPlans(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('admin:plans.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreateOrUpdate = async (data: SubscriptionPlanInput) => {
    setActionLoading(true);
    try {
      if (selectedPlan) {
        await plansApi.updatePlanAdmin(selectedPlan.id, data);
        toast.success(t('admin:plans.updateSuccess'));
      } else {
        await plansApi.createPlanAdmin(data);
        toast.success(t('admin:plans.createSuccess'));
      }
      setIsModalOpen(false);
      setSelectedPlan(null);
      await fetchPlans();
    } catch (err: any) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (plan: SubscriptionPlanItem) => {
    try {
      await plansApi.togglePlanStatusAdmin(plan.id);
      toast.success(
        plan.est_actif
          ? t('admin:plans.deactivatedSuccess')
          : t('admin:plans.activatedSuccess')
      );
      await fetchPlans();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('admin:plans.toggleError'));
    }
  };

  const handleDelete = async () => {
    if (!planToDelete) return;
    setActionLoading(true);
    try {
      await plansApi.deletePlanAdmin(planToDelete.id);
      toast.success(t('admin:plans.deleteSuccess'));
      setPlanToDelete(null);
      await fetchPlans();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t('admin:plans.deleteError'));
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center font-body min-h-[400px]">
        <Icon icon="solar:shield-cross-bold-duotone" className="text-5xl text-rose-500 mb-4 opacity-80" />
        <h2 className="font-title text-xl font-bold text-slate-900 dark:text-white">
          {t('admin:plans.accessDeniedTitle')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
          {t('admin:plans.accessDeniedDesc')}
        </p>
      </div>
    );
  }

  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'fr';
  const totalPlans = plans.length;
  const activePlansCount = plans.filter((p) => p.est_actif).length;
  const maxNumbersAllowed = plans.length ? Math.max(...plans.map((p) => p.max_numeros)) : 0;
  const maxMembersAllowed = plans.length ? Math.max(...plans.map((p) => p.max_membres)) : 0;

  return (
    <div className="space-y-6 font-body pb-12">
      <PageHeader
        title={t('admin:plans.pageTitle')}
        subtitle={t('admin:plans.pageSubtitle')}
        actions={[
          {
            label: t('admin:plans.createButton'),
            onClick: () => {
              setSelectedPlan(null);
              setIsModalOpen(true);
            },
            icon: 'solar:add-circle-bold',
            variant: 'primary',
          },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title={t('admin:plans.kpiTotal')}
          value={totalPlans}
          icon="solar:card-2-bold-duotone"
          color="text-brand-blue bg-brand-blue/10"
        />
        <KpiCard
          title={t('admin:plans.kpiActive')}
          value={activePlansCount}
          icon="solar:check-circle-bold-duotone"
          color="text-emerald-500 bg-emerald-500/10"
        />
        <KpiCard
          title={t('admin:plans.kpiMaxNumbers')}
          value={`${maxNumbersAllowed} ${t('admin:plans.numbersUnit')}`}
          icon="solar:phone-bold-duotone"
          color="text-amber-500 bg-amber-500/10"
        />
        <KpiCard
          title={t('admin:plans.kpiMaxMembers')}
          value={`${maxMembersAllowed} ${t('admin:plans.membersUnit')}`}
          icon="solar:users-group-two-rounded-bold-duotone"
          color="text-purple-500 bg-purple-500/10"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-brand-darkBg rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon="solar:tag-price-bold-duotone" className="text-xl text-brand-blue" />
            <h2 className="font-title text-base font-bold text-slate-900 dark:text-white">
              {t('admin:plans.tableTitle')}
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {plans.length} {t('admin:plans.itemsCount')}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <Icon icon="solar:refresh-circle-bold" className="text-3xl animate-spin mx-auto mb-2 text-brand-blue" />
            <p className="text-sm">{t('common:loading')}</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Icon icon="solar:box-minimalistic-bold-duotone" className="text-4xl mx-auto mb-2 opacity-50" />
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              {t('admin:plans.noPlans')}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {t('admin:plans.noPlansDesc')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4 font-semibold">{t('admin:plans.thOrder')}</th>
                  <th className="py-3 px-4 font-semibold">{t('admin:plans.thName')}</th>
                  <th className="py-3 px-4 font-semibold">{t('admin:plans.thPrice')}</th>
                  <th className="py-3 px-4 font-semibold">{t('admin:plans.thDuration')}</th>
                  <th className="py-3 px-4 font-semibold">{t('admin:plans.thCapacities')}</th>
                  <th className="py-3 px-4 font-semibold">{t('admin:plans.thBadge')}</th>
                  <th className="py-3 px-4 font-semibold">{t('admin:plans.thStatus')}</th>
                  <th className="py-3 px-4 font-semibold text-right">{t('common:actions.label')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {plans.map((p) => {
                  const badgeText = currentLang === 'en' ? (p.badge_en || p.badge_fr) : (p.badge_fr || p.badge_en);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400 font-semibold">{p.ordre}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {currentLang === 'en' ? p.nom_en : p.nom_fr}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">code: {p.code}</div>
                        {p.description_fr && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {currentLang === 'en' ? (p.description_en || p.description_fr) : p.description_fr}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {p.prix_fcfa.toLocaleString('fr-FR')} FCFA
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[11px]">
                          <Icon icon="solar:clock-circle-bold" className="text-xs text-brand-blue" />
                          {p.duree_jours} {p.duree_jours > 1 ? t('admin:plans.daysSuffix') : t('admin:plans.daySuffix')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 text-[11px]">
                          <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                            <Icon icon="solar:phone-bold" className="text-emerald-500" />
                            {p.max_numeros} {p.max_numeros > 1 ? t('admin:plans.numberPlural') : t('admin:plans.numberSingular')}
                          </span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <Icon icon="solar:users-group-two-rounded-bold" className="text-indigo-400" />
                            {p.max_membres} {p.max_membres > 1 ? t('admin:plans.memberPlural') : t('admin:plans.memberSingular')}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {badgeText ? (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px]">
                            {badgeText}
                          </Badge>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                            p.est_actif
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                          }`}
                          title={t('admin:plans.clickToToggle')}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${p.est_actif ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {p.est_actif ? t('admin:plans.statusActive') : t('admin:plans.statusInactive')}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedPlan(p);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                            title={t('admin:plans.actionEdit')}
                          >
                            <Icon icon="solar:pen-bold" className="text-base" />
                          </button>
                          <button
                            onClick={() => setPlanToDelete(p)}
                            className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition"
                            title={t('admin:plans.actionDelete')}
                          >
                            <Icon icon="solar:trash-bin-trash-bold" className="text-base" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Formulaire Création / Édition */}
      <PlanFormModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPlan(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={selectedPlan}
        loading={actionLoading}
      />

      {/* Dialogue de Confirmation de Suppression */}
      <ConfirmDialog
        isOpen={Boolean(planToDelete)}
        title={t('admin:plans.confirmDeleteTitle')}
        description={t('admin:plans.confirmDeleteDesc')}
        confirmLabel={t('common:actions.delete')}
        cancelLabel={t('common:actions.cancel')}
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setPlanToDelete(null)}
        isLoading={actionLoading}
      />
    </div>
  );
}
