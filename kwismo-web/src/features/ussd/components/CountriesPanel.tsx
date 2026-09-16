import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/ui/button';
import { CountrySelect } from '@/shared/ui/country-select';
import { COUNTRY_LIST } from '@/shared/lib/phone';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { usePermissions } from '@/shared/hooks/usePermissions';
import type { CountryItem, CountryIn } from '../services/ussd.api';

interface CountriesPanelProps {
  countries: CountryItem[];
  selectedCountryId: string;
  isLoading?: boolean;
  onSelectCountry: (id: string) => void;
  onCreateCountry: (payload: CountryIn) => Promise<boolean>;
  onUpdateCountry: (id: string, payload: CountryIn) => Promise<boolean>;
  onDeleteCountry: (id: string) => Promise<boolean>;
}

export default function CountriesPanel({
  countries,
  selectedCountryId,
  isLoading = false,
  onSelectCountry,
  onCreateCountry,
  onUpdateCountry,
  onDeleteCountry,
}: CountriesPanelProps) {
  const { t } = useTranslation(['admin', 'common']);
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('ussd:create');
  const canUpdate = hasPermission('ussd:update');
  const canDelete = hasPermission('ussd:delete');

  const [editingCountry, setEditingCountry] = useState<CountryItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CountryItem | null>(null);

  const [draft, setDraft] = useState<CountryIn>({
    nom: '',
    code_pays: '+237',
    est_par_defaut: false,
  });

  const handleOpenAdd = () => {
    setDraft({ nom: 'Cameroun', code_pays: '+237', est_par_defaut: false });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (c: CountryItem) => {
    setEditingCountry(c);
    setDraft({ nom: c.nom, code_pays: c.code_pays, est_par_defaut: c.est_par_defaut });
  };

  const handleSaveAdd = async () => {
    const ok = await onCreateCountry(draft);
    if (ok) {
      setIsAddOpen(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCountry) return;
    const ok = await onUpdateCountry(editingCountry.id, draft);
    if (ok) {
      setEditingCountry(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await onDeleteCountry(deleteTarget.id);
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
          <Icon icon="solar:global-bold-duotone" className="text-brand-green text-xl" />
          <h3 className="font-title text-sm font-bold text-slate-900 dark:text-white">
            {t('admin:ussd.countries')} ({countries.length})
          </h3>
        </div>
        {canCreate && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1 text-xs font-bold text-brand-green hover:underline cursor-pointer"
          >
            <Icon icon="solar:add-circle-bold" className="text-sm" /> {t('admin:ussd.addCountry')}
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[500px] overflow-y-auto">
        {countries.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {t('admin:ussd.noCountries')}
          </div>
        ) : (
          countries.map((c) => {
            const active = c.id === selectedCountryId;
            const countryObj = COUNTRY_LIST.find(
              (co) => co.dialCode === c.code_pays || co.nameFr.toLowerCase() === c.nom.toLowerCase()
            );
            const flagIcon = countryObj?.icon || 'circle-flags:cm';

            return (
              <div
                key={c.id}
                onClick={() => onSelectCountry(c.id)}
                className={`p-4 flex items-center justify-between cursor-pointer transition ${
                  active
                    ? 'bg-brand-navy/5 dark:bg-brand-orange/10 border-l-4 border-brand-navy dark:border-brand-orange'
                    : 'hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span title={c.nom}>
                    <Icon icon={flagIcon} className="text-2xl shrink-0" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{c.nom}</span>
                      {c.est_par_defaut && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {t('admin:ussd.default')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {c.code_pays}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {canUpdate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(c);
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
                        setDeleteTarget(c);
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

      {(isAddOpen || editingCountry) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-white dark:bg-[#161E33] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl space-y-4 font-body">
            <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
              {editingCountry ? t('admin:ussd.editCountry') : t('admin:ussd.addCountry')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('admin:ussd.selectCountry')}
                </label>
                <CountrySelect
                  value={
                    COUNTRY_LIST.find((co) => co.dialCode === draft.code_pays)?.code || 'CM'
                  }
                  onChange={(countryCode) => {
                    const countryObj = COUNTRY_LIST.find((c) => c.code === countryCode);
                    if (countryObj) {
                      setDraft((prev) => ({
                        ...prev,
                        nom: countryObj.nameFr,
                        code_pays: countryObj.dialCode,
                      }));
                    }
                  }}
                />
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 space-y-1 text-xs">
                <p className="flex justify-between">
                  <span className="text-slate-500 font-semibold">{t('admin:ussd.countryName')}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{draft.nom || '—'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500 font-semibold">{t('admin:ussd.dialCode')}:</span>
                  <span className="font-mono font-bold text-brand-green">{draft.code_pays || '—'}</span>
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={draft.est_par_defaut}
                  onChange={(e) => setDraft({ ...draft, est_par_defaut: e.target.checked })}
                  className="rounded border-slate-300 text-brand-green focus:ring-brand-green h-4 w-4"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {t('admin:ussd.setDefault')}
                </span>
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingCountry(null);
                }}
              >
                {t('common:actions.cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={editingCountry ? handleSaveEdit : handleSaveAdd}
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
        title={t('admin:ussd.deleteCountryTitle')}
        description={`${t('admin:ussd.deleteCountryDesc')} ${deleteTarget?.nom} ?`}
        confirmLabel={t('common:actions.delete')}
        variant="danger"
      />
    </div>
  );
}
