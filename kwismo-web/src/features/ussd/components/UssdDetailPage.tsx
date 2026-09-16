import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { PageHeader } from '@/shared/components';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { FormSkeleton } from '@/shared/ui/skeleton';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { toast } from '@/shared/store/toastStore';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { ussdApi } from '../services/ussd.api';
import type { OperatorItem, UssdActionItem } from '../services/ussd.api';

export default function UssdDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['admin', 'common']);
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission('ussd:update');

  const [operator, setOperator] = useState<OperatorItem | null>(null);
  const [actions, setActions] = useState<UssdActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const [initialData, setInitialData] = useState({
    nom: '',
    prefixes: '',
  });

  const [formData, setFormData] = useState({ ...initialData });

  useEffect(() => {
    let mounted = true;
    if (id) {
      setLoading(true);
      ussdApi
        .getOperators('')
        .then(async (ops) => {
          if (!mounted) return;
          const found = ops.find((o) => o.id === id);
          if (found) {
            setOperator(found);
            const state = {
              nom: found.nom || '',
              prefixes: found.prefixes?.map((p) => p.prefixe).join(', ') || '',
            };
            setInitialData(state);
            setFormData(state);

            try {
              const actList = await ussdApi.getActions(found.id);
              if (mounted) setActions(actList);
            } catch {
              if (mounted) setActions([]);
            }
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

  if (!operator) {
    return (
      <div className="p-6 font-body text-center py-12">
        <Icon icon="solar:global-bold-duotone" className="text-5xl text-slate-400 mx-auto mb-3" />
        <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
          {t('admin:ussd.operatorNotFound')}
        </h3>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/app/ussd')}>
          {t('common:actions.back')}
        </Button>
      </div>
    );
  }

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleSave = async () => {
    if (!canUpdate) return;
    const prefixes = formData.prefixes
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    try {
      const updated = await ussdApi.updateOperator(operator.id, {
        nom: formData.nom,
        country_id: operator.country_id,
        prefixes,
      });
      setOperator(updated);
      setInitialData({ ...formData });
      setIsEditing(false);
      toast.success(t('admin:ussd.operatorSaveSuccess'));
    } catch {
      toast.error(t('admin:ussd.operatorSaveError'));
    }
  };

  const handleBack = () => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      navigate('/app/ussd');
    }
  };

  const handleConfirmDiscard = () => {
    setShowUnsavedModal(false);
    navigate('/app/ussd');
  };

  const handleConfirmSaveAndLeave = async () => {
    await handleSave();
    setShowUnsavedModal(false);
    navigate('/app/ussd');
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body max-w-6xl mx-auto">
      <PageHeader
        title={`${t('admin:ussd.operatorDetailTitle')} — ${operator.nom}`}
        subtitle={t('admin:ussd.operatorDetailSubtitle')}
        showBreadcrumb={false}
        showBack={true}
        onBack={handleBack}
        actions={
          canUpdate
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

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon icon="solar:phone-calling-bold-duotone" className="text-brand-green text-xl" />
            {t('admin:ussd.networkSettings')}
          </h3>
          {isEditing && (
            <span className="text-xs font-semibold text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full border border-brand-orange/20 animate-pulse">
              {t('admin:ussd.editModeActive')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label={t('admin:ussd.operatorName')}
            disabled={!isEditing}
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />
          <Input
            label={t('admin:ussd.prefixesLabel')}
            disabled={!isEditing}
            value={formData.prefixes}
            onChange={(e) => setFormData({ ...formData, prefixes: e.target.value })}
          />
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-4">
        <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon icon="solar:code-square-bold-duotone" className="text-brand-blue text-xl" />
          {t('admin:ussd.definedActions')} ({actions.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((u) => (
            <div key={u.id} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] flex items-center justify-between">
              <div>
                <p className="font-title text-xs font-bold text-slate-900 dark:text-white">{u.nom_action}</p>
                <p className="font-mono text-xs text-brand-green font-bold mt-1">{u.code_ussd}</p>
              </div>
              <Button size="xs" variant="outline" onClick={() => toast.info(`${t('admin:ussd.testUSSD')}: ${u.format}`)}>
                {t('common:actions.test')}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showUnsavedModal}
        onClose={handleConfirmDiscard}
        onConfirm={handleConfirmSaveAndLeave}
        title={t('common:unsavedTitle')}
        description={t('common:unsavedDesc')}
        confirmLabel={t('common:saveAndLeave')}
        cancelLabel={t('common:discardChanges')}
        variant="warning"
      />
    </div>
  );
}
