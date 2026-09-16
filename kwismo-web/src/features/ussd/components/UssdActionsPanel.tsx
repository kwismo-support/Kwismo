import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { usePermissions } from '@/shared/hooks/usePermissions';
import type { UssdActionItem, UssdActionIn } from '../services/ussd.api';

interface UssdActionsPanelProps {
  operatorId: string;
  actions: UssdActionItem[];
  isLoading?: boolean;
  onCreateAction: (payload: UssdActionIn) => Promise<boolean>;
  onUpdateAction: (id: string, payload: UssdActionIn) => Promise<boolean>;
  onDeleteAction: (id: string) => Promise<boolean>;
}

export default function UssdActionsPanel({
  operatorId,
  actions,
  isLoading = false,
  onCreateAction,
  onUpdateAction,
  onDeleteAction,
}: UssdActionsPanelProps) {
  const { t } = useTranslation(['admin', 'common']);
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('ussd:create');
  const canUpdate = hasPermission('ussd:update');
  const canDelete = hasPermission('ussd:delete');

  const [editingAction, setEditingAction] = useState<UssdActionItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UssdActionItem | null>(null);

  const [draft, setDraft] = useState<Omit<UssdActionIn, 'operator_id'>>({
    nom_action: '',
    code_ussd: '',
    format: '',
  });

  const previewUssd = (formatStr: string) => {
    return formatStr
      .replace(/\{numero\}/g, '691234567')
      .replace(/\{montant\}/g, '5000')
      .replace(/\{code\}/g, '1234');
  };

  const handleOpenAdd = () => {
    setDraft({ nom_action: '', code_ussd: '*126#', format: '*126*{numero}*{montant}#' });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (act: UssdActionItem) => {
    setEditingAction(act);
    setDraft({
      nom_action: act.nom_action,
      code_ussd: act.code_ussd,
      format: act.format,
    });
  };

  const handleSaveAdd = async () => {
    if (!draft.nom_action.trim() || !draft.code_ussd.trim() || !draft.format.trim()) return;
    const ok = await onCreateAction({
      ...draft,
      operator_id: operatorId,
    });
    if (ok) {
      setIsAddOpen(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingAction || !draft.nom_action.trim() || !draft.code_ussd.trim() || !draft.format.trim()) return;
    const ok = await onUpdateAction(editingAction.id, {
      ...draft,
      operator_id: operatorId,
    });
    if (ok) {
      setEditingAction(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await onDeleteAction(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm animate-pulse font-body">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-48 mb-2" />
        <div className="flex flex-col gap-3 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm overflow-hidden font-body">
      <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/5">
        <div className="flex items-center gap-2">
          <Icon icon="solar:key-bold-duotone" className="text-brand-orange text-xl" />
          <h3 className="font-title text-sm font-bold text-slate-900 dark:text-white">
            {t('admin:ussd.actions')} ({actions.length})
          </h3>
        </div>
        {canCreate && operatorId && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1 text-xs font-bold text-brand-orange hover:underline cursor-pointer"
          >
            <Icon icon="solar:add-circle-bold" className="text-sm" /> {t('admin:ussd.addAction')}
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[500px] overflow-y-auto">
        {!operatorId ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {t('admin:ussd.selectOperatorFirst')}
          </div>
        ) : actions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {t('admin:ussd.noActions')}
          </div>
        ) : (
          actions.map((act) => (
            <div
              key={act.id}
              className="p-4 flex items-start justify-between gap-2 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{act.nom_action}</p>
                <code className="inline-block mt-1 px-2.5 py-1 rounded bg-brand-navy/10 dark:bg-white/10 text-brand-navy dark:text-brand-orange text-xs font-mono font-bold">
                  {act.code_ussd}
                </code>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  Format: <span className="text-brand-green">{act.format}</span>
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {t('admin:ussd.preview')}: {previewUssd(act.format)}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {canUpdate && (
                  <button
                    onClick={() => handleOpenEdit(act)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
                  >
                    <Icon icon="solar:pen-bold" className="text-sm" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => setDeleteTarget(act)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10"
                  >
                    <Icon icon="solar:trash-bin-trash-bold" className="text-sm" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {(isAddOpen || editingAction) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-white dark:bg-[#161E33] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl space-y-4 font-body">
            <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
              {editingAction ? t('admin:ussd.editAction') : t('admin:ussd.addAction')}
            </h3>
            <div className="space-y-3">
              <Input
                label={t('admin:ussd.actionName')}
                value={draft.nom_action}
                onChange={(e) => setDraft({ ...draft, nom_action: e.target.value })}
                required
                placeholder="Transfert Mobile Money"
              />
              <Input
                label={t('admin:ussd.codeUssd')}
                value={draft.code_ussd}
                onChange={(e) => setDraft({ ...draft, code_ussd: e.target.value })}
                required
                placeholder="*126#"
              />
              <Input
                label={t('admin:ussd.format')}
                value={draft.format}
                onChange={(e) => setDraft({ ...draft, format: e.target.value })}
                required
                placeholder="*126*{numero}*{montant}#"
              />
              {draft.format && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 text-xs font-mono">
                  <span className="text-slate-400 font-semibold block mb-1">{t('admin:ussd.preview')}:</span>
                  <code className="text-brand-green font-bold">{previewUssd(draft.format)}</code>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingAction(null);
                }}
              >
                {t('common:actions.cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={editingAction ? handleSaveEdit : handleSaveAdd}
              >
                {t('common:actions.save')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={t('admin:ussd.deleteActionTitle')}
        description={`${t('admin:ussd.deleteActionDesc')} ${deleteTarget?.nom_action} ?`}
        confirmLabel={t('common:actions.delete')}
        variant="danger"
      />
    </div>
  );
}
