import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { PageHeader } from '@/shared/components';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { CountrySelect } from '@/shared/ui/country-select';
import { COUNTRY_LIST } from '@/shared/lib/phone';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { toast } from '@/shared/store/toastStore';

interface UssdAction {
  id: number;
  label: string;
  code: string;
}

interface Operator {
  id: number;
  nom: string;
  prefixes: string[];
  ussd: UssdAction[];
}

interface Country {
  id: number;
  pays: string;
  code: string;
  indicatif: string;
  isDefault: boolean;
  operateurs: Operator[];
}

const initialCountries: Country[] = [
  {
    id: 1,
    pays: 'Cameroun',
    code: 'CM',
    indicatif: '+237',
    isDefault: true,
    operateurs: [
      {
        id: 11,
        nom: 'MTN Cameroun',
        prefixes: ['67', '68', '650-654'],
        ussd: [
          { id: 111, label: 'Transfert Mobile Money', code: '*126*{numero}*{montant}#' },
          { id: 112, label: 'Retrait d’argent', code: '*127*{numero}*{montant}#' },
          { id: 113, label: 'Consultation de solde', code: '*126#' },
        ],
      },
      {
        id: 12,
        nom: 'Orange Cameroun',
        prefixes: ['655-659', '69'],
        ussd: [
          { id: 121, label: 'Transfert Orange Money', code: '*150*{numero}*{montant}#' },
          { id: 122, label: 'Retrait d’espèces', code: '*151*{numero}*{montant}#' },
        ],
      },
    ],
  },
  {
    id: 2,
    pays: 'Côte d’Ivoire',
    code: 'CI',
    indicatif: '+225',
    isDefault: false,
    operateurs: [
      {
        id: 21,
        nom: 'Orange CI',
        prefixes: ['07', '08', '09'],
        ussd: [
          { id: 211, label: 'Transfert Orange Money', code: '*144*{numero}*{montant}#' },
        ],
      },
      {
        id: 22,
        nom: 'Moov Africa CI',
        prefixes: ['01', '02'],
        ussd: [{ id: 221, label: 'Transfert Flooz', code: '*155*{numero}*{montant}#' }],
      },
    ],
  },
  {
    id: 3,
    pays: 'Sénégal',
    code: 'SN',
    indicatif: '+221',
    isDefault: false,
    operateurs: [
      {
        id: 31,
        nom: 'Wave Sénégal',
        prefixes: ['77', '78', '70'],
        ussd: [{ id: 311, label: 'Transfert d’argent Wave', code: '*999*{numero}*{montant}#' }],
      },
    ],
  },
];

export default function UssdPage() {
  const { t } = useTranslation('admin');
  const [countries, setCountries] = useState<Country[]>(initialCountries);
  const [selCountryId, setSelCountryId] = useState<number>(initialCountries[0]?.id || 1);
  const [selOperatorId, setSelOperatorId] = useState<number>(initialCountries[0]?.operateurs[0]?.id || 11);

  // Modals state
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [editingOperator, setEditingOperator] = useState<{ op?: Operator; countryId: number } | null>(null);
  const [editingUssd, setEditingUssd] = useState<{ ussd?: UssdAction; countryId: number; operatorId: number } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'country' | 'operator' | 'ussd'; item: any } | null>(null);

  // Form drafts
  const [countryDraft, setCountryDraft] = useState({ pays: '', code: '', indicatif: '', isDefault: false });
  const [operatorDraft, setOperatorDraft] = useState({ nom: '', prefixes: '' });
  const [ussdDraft, setUssdDraft] = useState({ label: '', code: '' });

  const selectedCountry = countries.find((c) => c.id === selCountryId) || countries[0];
  const selectedOperator = selectedCountry?.operateurs.find((o) => o.id === selOperatorId) || selectedCountry?.operateurs[0];

  const previewUssd = (code: string) => {
    return code
      .replace(/\{numero\}/g, '691234567')
      .replace(/\{montant\}/g, '5000')
      .replace(/\{code\}/g, '1234');
  };

  const handleOpenCountryModal = (c?: Country) => {
    if (c) {
      setEditingCountry(c);
      setCountryDraft({ pays: c.pays, code: c.code, indicatif: c.indicatif, isDefault: c.isDefault });
    } else {
      setEditingCountry({ id: 0, pays: '', code: '', indicatif: '+237', isDefault: false, operateurs: [] });
      setCountryDraft({ pays: '', code: '', indicatif: '+237', isDefault: false });
    }
  };

  const handleSaveCountry = () => {
    if (!countryDraft.pays.trim()) {
      toast.error('Le nom du pays est obligatoire.');
      return;
    }
    if (editingCountry?.id) {
      setCountries((cs) =>
        cs.map((c) =>
          c.id === editingCountry.id
            ? { ...c, ...countryDraft, code: countryDraft.code.toUpperCase() }
            : countryDraft.isDefault
            ? { ...c, isDefault: false }
            : c
        )
      );
      toast.success('Pays mis à jour.');
    } else {
      const newC: Country = {
        id: Date.now(),
        ...countryDraft,
        code: countryDraft.code.toUpperCase(),
        operateurs: [],
      };
      setCountries((cs) => [...(countryDraft.isDefault ? cs.map((c) => ({ ...c, isDefault: false })) : cs), newC]);
      setSelCountryId(newC.id);
      toast.success('Nouveau pays ajouté.');
    }
    setEditingCountry(null);
  };

  const handleOpenOperatorModal = (o?: Operator) => {
    if (!selectedCountry) return;
    if (o) {
      setEditingOperator({ op: o, countryId: selectedCountry.id });
      setOperatorDraft({ nom: o.nom, prefixes: o.prefixes.join(', ') });
    } else {
      setEditingOperator({ countryId: selectedCountry.id });
      setOperatorDraft({ nom: '', prefixes: '' });
    }
  };

  const handleSaveOperator = () => {
    if (!operatorDraft.nom.trim()) {
      toast.error('Le nom de l’opérateur est obligatoire.');
      return;
    }
    const prefixes = operatorDraft.prefixes.split(',').map((s) => s.trim()).filter(Boolean);
    if (editingOperator?.op?.id) {
      setCountries((cs) =>
        cs.map((c) =>
          c.id !== editingOperator.countryId
            ? c
            : {
                ...c,
                operateurs: c.operateurs.map((o) =>
                  o.id === editingOperator.op?.id ? { ...o, nom: operatorDraft.nom, prefixes } : o
                ),
              }
        )
      );
      toast.success('Opérateur mis à jour.');
    } else if (editingOperator) {
      const newOp: Operator = {
        id: Date.now(),
        nom: operatorDraft.nom,
        prefixes,
        ussd: [],
      };
      setCountries((cs) =>
        cs.map((c) => (c.id === editingOperator.countryId ? { ...c, operateurs: [...c.operateurs, newOp] } : c))
      );
      setSelOperatorId(newOp.id);
      toast.success('Nouvel opérateur ajouté.');
    }
    setEditingOperator(null);
  };

  const handleOpenUssdModal = (u?: UssdAction) => {
    if (!selectedCountry || !selectedOperator) return;
    if (u) {
      setEditingUssd({ ussd: u, countryId: selectedCountry.id, operatorId: selectedOperator.id });
      setUssdDraft({ label: u.label, code: u.code });
    } else {
      setEditingUssd({ countryId: selectedCountry.id, operatorId: selectedOperator.id });
      setUssdDraft({ label: '', code: '' });
    }
  };

  const handleSaveUssd = () => {
    if (!ussdDraft.label.trim() || !ussdDraft.code.trim()) {
      toast.error('Le libellé et le code USSD sont obligatoires.');
      return;
    }
    if (editingUssd?.ussd?.id) {
      setCountries((cs) =>
        cs.map((c) => {
          if (c.id !== editingUssd.countryId) return c;
          return {
            ...c,
            operateurs: c.operateurs.map((o) => {
              if (o.id !== editingUssd.operatorId) return o;
              return {
                ...o,
                ussd: o.ussd.map((u) => (u.id === editingUssd.ussd?.id ? { ...u, ...ussdDraft } : u)),
              };
            }),
          };
        })
      );
      toast.success('Code USSD mis à jour.');
    } else if (editingUssd) {
      const newUssd: UssdAction = { id: Date.now(), ...ussdDraft };
      setCountries((cs) =>
        cs.map((c) => {
          if (c.id !== editingUssd.countryId) return c;
          return {
            ...c,
            operateurs: c.operateurs.map((o) =>
              o.id === editingUssd.operatorId ? { ...o, ussd: [...o.ussd, newUssd] } : o
            ),
          };
        })
      );
      toast.success('Nouveau code USSD ajouté.');
    }
    setEditingUssd(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'country') {
      setCountries((cs) => cs.filter((c) => c.id !== deleteTarget.item.id));
      if (selCountryId === deleteTarget.item.id) {
        setSelCountryId(countries.find((c) => c.id !== deleteTarget.item.id)?.id || 0);
      }
      toast.success('Pays supprimé.');
    } else if (deleteTarget.type === 'operator') {
      setCountries((cs) =>
        cs.map((c) =>
          c.id === selectedCountry.id
            ? { ...c, operateurs: c.operateurs.filter((o) => o.id !== deleteTarget.item.id) }
            : c
        )
      );
      toast.success('Opérateur supprimé.');
    } else if (deleteTarget.type === 'ussd') {
      setCountries((cs) =>
        cs.map((c) =>
          c.id !== selectedCountry.id
            ? c
            : {
                ...c,
                operateurs: c.operateurs.map((o) =>
                  o.id !== selectedOperator.id
                    ? o
                    : { ...o, ussd: o.ussd.filter((u) => u.id !== deleteTarget.item.id) }
                ),
              }
        )
      );
      toast.success('Code USSD supprimé.');
    }
    setDeleteTarget(null);
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <PageHeader
        title={t('ussd.title')}
        subtitle="Arborescence interactive : Pays → Opérateurs → Actions USSD."
        showBreadcrumb={true}
        actions={[
          {
            label: 'Nouveau pays',
            icon: 'solar:global-bold',
            variant: 'primary',
            onClick: () => handleOpenCountryModal(),
          },
        ]}
      />

      {/* 3-Column Tree Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Countries */}
        <div className="flex flex-col rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/5">
            <div className="flex items-center gap-2">
              <Icon icon="solar:global-bold-duotone" className="text-brand-green text-xl" />
              <h3 className="font-title text-sm font-bold text-slate-900 dark:text-white">
                Pays ({countries.length})
              </h3>
            </div>
            <button
              onClick={() => handleOpenCountryModal()}
              className="flex items-center gap-1 text-xs font-bold text-brand-green hover:underline cursor-pointer"
            >
              <Icon icon="solar:add-circle-bold" className="text-sm" /> Ajouter
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[500px] overflow-y-auto">
            {countries.map((c) => {
              const active = c.id === selCountryId;
              const countryObj = COUNTRY_LIST.find(
                (co) => co.code.toLowerCase() === c.code.toLowerCase() || co.nameFr.toLowerCase() === c.pays.toLowerCase()
              );
              const flagIcon = countryObj?.icon || 'circle-flags:cm';

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelCountryId(c.id);
                    setSelOperatorId(c.operateurs[0]?.id || 0);
                  }}
                  className={`p-4 flex items-center justify-between cursor-pointer transition ${
                    active
                      ? 'bg-brand-navy/5 dark:bg-brand-orange/10 border-l-4 border-brand-navy dark:border-brand-orange'
                      : 'hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span title={c.pays}>
                      <Icon icon={flagIcon} className="text-2xl shrink-0" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{c.pays}</span>
                        {c.isDefault && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Défaut
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {c.indicatif} · {c.operateurs.length} opérateur(s)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCountryModal(c);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
                    >
                      <Icon icon="solar:pen-bold" className="text-sm" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ type: 'country', item: c });
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10"
                    >
                      <Icon icon="solar:trash-bin-trash-bold" className="text-sm" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Operators */}
        <div className="flex flex-col rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/5">
            <div className="flex items-center gap-2">
              <Icon icon="solar:radio-minimalistic-bold-duotone" className="text-brand-blue text-xl" />
              <h3 className="font-title text-sm font-bold text-slate-900 dark:text-white">
                Opérateurs {selectedCountry ? `(${selectedCountry.operateurs.length})` : ''}
              </h3>
            </div>
            {selectedCountry && (
              <button
                onClick={() => handleOpenOperatorModal()}
                className="flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline cursor-pointer"
              >
                <Icon icon="solar:add-circle-bold" className="text-sm" /> Ajouter
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[500px] overflow-y-auto">
            {!selectedCountry || selectedCountry.operateurs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Aucun opérateur pour ce pays. Cliquez sur "Ajouter".
              </div>
            ) : (
              selectedCountry.operateurs.map((o) => {
                const active = o.id === selOperatorId;
                return (
                  <div
                    key={o.id}
                    onClick={() => setSelOperatorId(o.id)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition ${
                      active
                        ? 'bg-brand-blue/5 dark:bg-brand-blue/10 border-l-4 border-brand-blue'
                        : 'hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white block">{o.nom}</span>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Préfixes: {o.prefixes.join(', ') || '—'} · {o.ussd.length} USSD
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenOperatorModal(o);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
                      >
                        <Icon icon="solar:pen-bold" className="text-sm" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ type: 'operator', item: o });
                        }}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10"
                      >
                        <Icon icon="solar:trash-bin-trash-bold" className="text-sm" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 3: USSD Actions */}
        <div className="flex flex-col rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/5">
            <div className="flex items-center gap-2">
              <Icon icon="solar:key-bold-duotone" className="text-brand-orange text-xl" />
              <h3 className="font-title text-sm font-bold text-slate-900 dark:text-white">
                Actions USSD {selectedOperator ? `(${selectedOperator.ussd.length})` : ''}
              </h3>
            </div>
            {selectedOperator && (
              <button
                onClick={() => handleOpenUssdModal()}
                className="flex items-center gap-1 text-xs font-bold text-brand-orange hover:underline cursor-pointer"
              >
                <Icon icon="solar:add-circle-bold" className="text-sm" /> Code USSD
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[500px] overflow-y-auto">
            {!selectedOperator || selectedOperator.ussd.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Aucun code USSD configuré. Cliquez sur "Code USSD".
              </div>
            ) : (
              selectedOperator.ussd.map((u) => (
                <div key={u.id} className="p-4 flex items-start justify-between gap-2 hover:bg-slate-50 dark:hover:bg-white/5">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{u.label}</p>
                    <code className="inline-block mt-1 px-2.5 py-1 rounded bg-brand-navy/10 dark:bg-white/10 text-brand-navy dark:text-brand-orange text-xs font-mono font-bold">
                      {u.code}
                    </code>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      Aperçu: {previewUssd(u.code)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenUssdModal(u)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10"
                    >
                      <Icon icon="solar:pen-bold" className="text-sm" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: 'ussd', item: u })}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10"
                    >
                      <Icon icon="solar:trash-bin-trash-bold" className="text-sm" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Country Modal */}
      {editingCountry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-white dark:bg-[#161E33] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl space-y-4 font-body">
            <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
              {editingCountry.id ? 'Modifier le pays' : 'Ajouter un pays'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Sélectionner un Pays
                </label>
                <CountrySelect
                  value={countryDraft.code}
                  onChange={(countryCode) => {
                    const countryObj = COUNTRY_LIST.find((c) => c.code === countryCode);
                    if (countryObj) {
                      setCountryDraft((prev) => ({
                        ...prev,
                        code: countryObj.code,
                        pays: countryObj.nameFr,
                        indicatif: countryObj.dialCode,
                      }));
                    }
                  }}
                />
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 space-y-1 text-xs">
                <p className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Nom du pays :</span>
                  <span className="font-bold text-slate-900 dark:text-white">{countryDraft.pays || '—'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Code ISO :</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{countryDraft.code || '—'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Indicatif téléphonique :</span>
                  <span className="font-mono font-bold text-brand-green">{countryDraft.indicatif || '—'}</span>
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={countryDraft.isDefault}
                  onChange={(e) => setCountryDraft({ ...countryDraft, isDefault: e.target.checked })}
                  className="rounded border-slate-300 text-brand-green focus:ring-brand-green h-4 w-4"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Définir comme pays par défaut
                </span>
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditingCountry(null)}>Annuler</Button>
              <Button variant="primary" onClick={handleSaveCountry}>Enregistrer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Operator Modal */}
      {editingOperator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-white dark:bg-[#161E33] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl space-y-4 font-body">
            <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
              {editingOperator.op?.id ? 'Modifier l’opérateur' : 'Ajouter un opérateur'}
            </h3>
            <div className="space-y-3">
              <Input
                label="Nom de l’opérateur"
                value={operatorDraft.nom}
                onChange={(e) => setOperatorDraft({ ...operatorDraft, nom: e.target.value })}
                required
              />
              <Input
                label="Préfixes (séparés par des virgules)"
                value={operatorDraft.prefixes}
                onChange={(e) => setOperatorDraft({ ...operatorDraft, prefixes: e.target.value })}
                placeholder="67, 68, 650-654"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditingOperator(null)}>Annuler</Button>
              <Button variant="primary" onClick={handleSaveOperator}>Enregistrer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit USSD Modal */}
      {editingUssd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-white dark:bg-[#161E33] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl space-y-4 font-body">
            <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
              {editingUssd.ussd?.id ? 'Modifier le code USSD' : 'Ajouter un code USSD'}
            </h3>
            <div className="space-y-3">
              <Input
                label="Nom de l’action"
                value={ussdDraft.label}
                onChange={(e) => setUssdDraft({ ...ussdDraft, label: e.target.value })}
                required
                placeholder="Transfert Mobile Money"
              />
              <Input
                label="Format du code USSD"
                value={ussdDraft.code}
                onChange={(e) => setUssdDraft({ ...ussdDraft, code: e.target.value })}
                required
                placeholder="*126*{numero}*{montant}#"
              />
              {ussdDraft.code && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 text-xs">
                  <span className="text-slate-400 font-semibold block mb-1">Aperçu :</span>
                  <code className="font-mono text-brand-green font-bold">{previewUssd(ussdDraft.code)}</code>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditingUssd(null)}>Annuler</Button>
              <Button variant="primary" onClick={handleSaveUssd}>Enregistrer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Supprimer ${deleteTarget?.type === 'country' ? 'ce pays' : deleteTarget?.type === 'operator' ? 'cet opérateur' : 'ce code USSD'} ?`}
        description="Cette action est irréversible et supprimera les éléments associés."
        confirmLabel="Supprimer définitivement"
        variant="danger"
      />
    </div>
  );
}
