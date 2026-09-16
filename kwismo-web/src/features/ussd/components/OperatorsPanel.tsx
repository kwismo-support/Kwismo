import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { usePermissions } from '@/shared/hooks/usePermissions';
import type { OperatorItem, OperatorIn } from '../services/ussd.api';

interface OperatorsPanelProps {
  countryId: string;
  operators: OperatorItem[];
  selectedOperatorId: string;
  isLoading?: boolean;
  onSelectOperator: (id: string) => void;
  onCreateOperator: (payload: OperatorIn) => Promise<boolean>;
  onUpdateOperator: (id: string, payload: OperatorIn) => Promise<boolean>;
  onDeleteOperator: (id: string) => Promise<boolean>;
}

export default function OperatorsPanel({
  countryId,
  operators,
  selectedOperatorId,
  isLoading = false,
  onSelectOperator,
  onCreateOperator,
  onUpdateOperator,
  onDeleteOperator,
}: OperatorsPanelProps) {
  const { t } = useTranslation(['admin', 'common']);
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('ussd:create');
  const canUpdate = hasPermission('ussd:update');
  const canDelete = hasPermission('ussd:delete');

  const [editingOperator, setEditingOperator] = useState<OperatorItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OperatorItem | null>(null);

  const [draft, setDraft] = useState<{ nom: string; prefixes: string }>({
    nom: '',
    prefixes: '',
  });

  const handleOpenAdd = () => {
    setDraft({ nom: '', prefixes: '' });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (op: OperatorItem) => {
    setEditingOperator(op);
    setDraft({
      nom: op.nom,
      prefixes: op.prefixes.map((p) => p.prefixe).join(', '),
    });
  };

  const handleSaveAdd = async () => {
    if (!draft.nom.trim()) return;
    const prefixes = draft.prefixes
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    const ok = await onCreateOperator({
      nom: draft.nom,
      country_id: countryId,
      prefixes,
    });
    if (ok) {
      setIsAddOpen(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingOperator || !draft.nom.trim()) return;
    const prefixes = draft.prefixes
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    const ok = await onUpdateOperator(editingOperator.id, {
      nom: draft.nom,
      country_id: countryId,
      prefixes,
    });
    if (ok) {
      setEditingOperator(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await onDeleteOperator(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm animate-pulse font-body">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-48 mb-2" />
        <div className="flex flex-col gap-3 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
          <Icon icon="solar:radio-minimalistic-bold-duotone" className="text-brand-blue text-xl" />
          <h3 className="font-title text-sm font-bold text-slate-900 dark:text-white">
            {t('admin:ussd.operators')} ({operators.length})
          </h3>
        </div>
        {canCreate && countryId && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline cursor-pointer"
          >
            <Icon icon="solar:add-circle-bold" className="text-sm" /> {t('admin:ussd.addOperator')}
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[500px] overflow-y-auto">
        {!countryId ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {t('admin:ussd.selectCountryFirst')}
          </div>
        ) : operators.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {t('admin:ussd.noOperators')}
          </div>
        ) : (
          operators.map((op) => {
            const active = op.id === selectedOperatorId;
            return (
              <div
                key={op.id}
                onClick={() => onSelectOperator(op.id)}
                className={`p-4 flex items-center justify-between cursor-pointer transition ${
                  active
                    ? 'bg-brand-blue/5 dark:bg-brand-blue/10 border-l-4 border-brand-blue'
                    : 'hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">{op.nom}</span>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {t('admin:ussd.prefix')}: {op.prefixes.map((p) => p.prefixe).join(', ') || '—'}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {canUpdate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(op);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
                    >
                      <Icon icon="solar:pen-bold" className="text-sm" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(op);
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10"
                    >
                      <Icon icon="solar:trash-bin-trash-bold" className="text-sm" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {(isAddOpen || editingOperator) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-white dark:bg-[#161E33] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl space-y-4 font-body">
            <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
              {editingOperator ? t('admin:ussd.editOperator') : t('admin:ussd.addOperator')}
            </h3>
            <div className="space-y-3">
              <Input
                label={t('admin:ussd.operatorName')}
                value={draft.nom}
                onChange={(e) => setDraft({ ...draft, nom: e.target.value })}
                required
              />
              <Input
                label={t('admin:ussd.prefixesLabel')}
                value={draft.prefixes}
                onChange={(e) => setDraft({ ...draft, prefixes: e.target.value })}
                placeholder="67, 68, 650-654"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingOperator(null);
                }}
              >
                {t('common:actions.cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={editingOperator ? handleSaveEdit : handleSaveAdd}
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
        title={t('admin:ussd.deleteOperatorTitle')}
        description={`${t('admin:ussd.deleteOperatorDesc')} ${deleteTarget?.nom} ?`}
        confirmLabel={t('common:actions.delete')}
        variant="danger"
      />
    </div>
  );
}
