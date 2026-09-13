import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { PageHeader } from '@/shared/components';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { toast } from '@/shared/store/toastStore';

interface ActionPerm {
  id: string;
  label: string;
  critique?: boolean;
}

interface PermModule {
  id: string;
  label: string;
  desc: string;
  actions: ActionPerm[];
}

const PERM_MODULES: PermModule[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    desc: 'Vue d’ensemble et KPI globaux',
    actions: [
      { id: 'view', label: 'Voir' },
      { id: 'export', label: 'Exporter' },
    ],
  },
  {
    id: 'users',
    label: 'Utilisateurs',
    desc: 'Comptes et numéros rattachés',
    actions: [
      { id: 'view', label: 'Voir' },
      { id: 'create', label: 'Créer' },
      { id: 'edit', label: 'Éditer' },
      { id: 'delete', label: 'Supprimer', critique: true },
      { id: 'suspend', label: 'Suspendre', critique: true },
      { id: 'invite', label: 'Inviter' },
    ],
  },
  {
    id: 'partners',
    label: 'Partenaires',
    desc: 'Entreprises partenaires',
    actions: [
      { id: 'view', label: 'Voir' },
      { id: 'create', label: 'Créer' },
      { id: 'edit', label: 'Éditer' },
      { id: 'delete', label: 'Supprimer', critique: true },
      { id: 'impersonate', label: 'Superviser', critique: true },
    ],
  },
  {
    id: 'numbers',
    label: 'Numéros',
    desc: 'Numéros analysés et affiliation',
    actions: [
      { id: 'view', label: 'Voir' },
      { id: 'create', label: 'Créer' },
      { id: 'edit', label: 'Éditer' },
      { id: 'delete', label: 'Supprimer', critique: true },
      { id: 'reanalyze', label: 'Réanalyser' },
      { id: 'changeStatus', label: 'Changer le statut', critique: true },
    ],
  },
  {
    id: 'countries',
    label: 'Pays / USSD',
    desc: 'Pays, opérateurs et codes USSD',
    actions: [
      { id: 'view', label: 'Voir' },
      { id: 'create', label: 'Créer' },
      { id: 'edit', label: 'Éditer' },
      { id: 'delete', label: 'Supprimer', critique: true },
    ],
  },
  {
    id: 'access',
    label: 'Droits d’accès',
    desc: 'Rôles et permissions',
    actions: [
      { id: 'view', label: 'Voir' },
      { id: 'create', label: 'Créer un rôle' },
      { id: 'edit', label: 'Éditer' },
      { id: 'delete', label: 'Supprimer', critique: true },
    ],
  },
  {
    id: 'reports',
    label: 'Rapports',
    desc: 'Analyses et exports',
    actions: [
      { id: 'view', label: 'Voir' },
      { id: 'export', label: 'Exporter' },
      { id: 'schedule', label: 'Planifier' },
    ],
  },
];

interface Role {
  id: number;
  role: string;
  desc: string;
  color: string;
  systeme: boolean;
  count: number;
  perms: Record<string, Record<string, boolean>>;
}

const buildPerms = (allGranted: boolean) => {
  const out: Record<string, Record<string, boolean>> = {};
  for (const m of PERM_MODULES) {
    out[m.id] = {};
    for (const a of m.actions) {
      out[m.id][a.id] = allGranted;
    }
  }
  return out;
};

const initialRoles: Role[] = [
  {
    id: 1,
    role: 'Admin',
    desc: 'Accès complet à toute la plateforme et à la configuration globale.',
    color: '#4D6AB1',
    systeme: true,
    count: 3,
    perms: buildPerms(true),
  },
  {
    id: 2,
    role: 'Partenaire',
    desc: 'Accès limité au périmètre affilié et aux API consommées.',
    color: '#7C3AED',
    systeme: true,
    count: 12,
    perms: buildPerms(false),
  },
  {
    id: 3,
    role: 'Analyste',
    desc: 'Lecture seule sur les rapports et indicateurs anti-fraude.',
    color: '#0891B2',
    systeme: false,
    count: 8,
    perms: buildPerms(false),
  },
  {
    id: 4,
    role: 'Support',
    desc: 'Gestion opérationnelle des comptes et déblocage de numéros.',
    color: '#F6A020',
    systeme: false,
    count: 5,
    perms: buildPerms(false),
  },
];

export default function AccessControlPage() {
  const { t } = useTranslation('admin');
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [selRoleId, setSelRoleId] = useState<number>(initialRoles[0].id);
  const [isEditingModal, setIsEditingModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleDraft, setRoleDraft] = useState({ role: '', desc: '', color: '#4D6AB1' });
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);

  const selectedRole = roles.find((r) => r.id === selRoleId) || roles[0];

  const handleToggleAction = (modId: string, actId: string) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== selRoleId) return r;
        const currentVal = r.perms[modId]?.[actId] || false;
        return {
          ...r,
          perms: {
            ...r.perms,
            [modId]: {
              ...(r.perms[modId] || {}),
              [actId]: !currentVal,
            },
          },
        };
      })
    );
  };

  const handleToggleModule = (modId: string, value: boolean) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== selRoleId) return r;
        const mod = PERM_MODULES.find((m) => m.id === modId);
        if (!mod) return r;
        const nextModActions: Record<string, boolean> = {};
        for (const act of mod.actions) {
          nextModActions[act.id] = value;
        }
        return {
          ...r,
          perms: {
            ...r.perms,
            [modId]: nextModActions,
          },
        };
      })
    );
  };

  const handleSaveRoleModal = () => {
    if (!roleDraft.role.trim()) {
      toast.error('Le nom du rôle est obligatoire.');
      return;
    }
    if (editingRole?.id) {
      setRoles((prev) =>
        prev.map((r) => (r.id === editingRole.id ? { ...r, ...roleDraft } : r))
      );
      toast.success('Rôle modifié avec succès.');
    } else {
      const newRole: Role = {
        id: Date.now(),
        role: roleDraft.role,
        desc: roleDraft.desc,
        color: roleDraft.color,
        systeme: false,
        count: 0,
        perms: buildPerms(false),
      };
      setRoles((prev) => [...prev, newRole]);
      setSelRoleId(newRole.id);
      toast.success('Nouveau rôle créé.');
    }
    setIsEditingModal(false);
  };

  const handleDeleteConfirm = () => {
    if (!deleteRole) return;
    if (deleteRole.systeme) {
      toast.error('Impossible de supprimer un rôle système.');
      setDeleteRole(null);
      return;
    }
    setRoles((prev) => prev.filter((r) => r.id !== deleteRole.id));
    if (selRoleId === deleteRole.id) {
      setSelRoleId(roles.find((r) => r.id !== deleteRole.id)?.id || 1);
    }
    setDeleteRole(null);
    toast.success('Rôle supprimé.');
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body max-w-7xl mx-auto">
      <PageHeader
        title={t('access.title')}
        subtitle="Gestion centralisée des rôles système, attribution des privilèges et matrice de sécurité par module."
        showBreadcrumb={true}
        actions={[
          {
            label: 'Nouveau rôle',
            icon: 'solar:shield-user-bold',
            variant: 'primary',
            onClick: () => {
              setEditingRole(null);
              setRoleDraft({ role: '', desc: '', color: '#4D6AB1' });
              setIsEditingModal(true);
            },
          },
        ]}
      />

      {/* Top Roles Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((r) => {
          const active = r.id === selRoleId;
          return (
            <div
              key={r.id}
              onClick={() => setSelRoleId(r.id)}
              className={`p-5 rounded-3xl border transition cursor-pointer flex flex-col justify-between ${
                active
                  ? 'border-brand-navy dark:border-brand-orange bg-white dark:bg-[#161E33] shadow-md ring-2 ring-brand-navy/20 dark:ring-brand-orange/20'
                  : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: r.color }}
                    />
                    <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
                      {r.role}
                    </h3>
                  </div>
                  {r.systeme ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                      Système
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange">
                      Personnalisé
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {r.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">{r.count} utilisateur(s)</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingRole(r);
                      setRoleDraft({ role: r.role, desc: r.desc, color: r.color });
                      setIsEditingModal(true);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    <Icon icon="solar:pen-bold" className="text-sm" />
                  </button>
                  {!r.systeme ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteRole(r);
                      }}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10"
                    >
                      <Icon icon="solar:trash-bin-trash-bold" className="text-sm" />
                    </button>
                  ) : (
                    <span title="Rôle système non supprimable" className="p-1 text-slate-300 dark:text-slate-600 cursor-not-allowed">
                      <Icon icon="solar:lock-bold" className="text-sm" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix for Selected Role */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedRole.color }} />
              <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
                Permissions du rôle « {selectedRole.role} »
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{selectedRole.desc}</p>
          </div>

          <Button
            variant="primary"
            onClick={() => toast.success(`Droits du rôle ${selectedRole.role} enregistrés.`)}
          >
            Enregistrer la matrice
          </Button>
        </div>

        <div className="space-y-4">
          {PERM_MODULES.map((mod) => {
            const modulePerms = selectedRole.perms[mod.id] || {};
            const allChecked = mod.actions.every((a) => modulePerms[a.id]);

            return (
              <div
                key={mod.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]"
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-3 mb-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {mod.label}
                    </h4>
                    <p className="text-xs text-slate-400">{mod.desc}</p>
                  </div>

                  <button
                    onClick={() => handleToggleModule(mod.id, !allChecked)}
                    className="text-xs font-semibold text-brand-green hover:underline cursor-pointer"
                  >
                    {allChecked ? 'Tout désélectionner' : 'Tout accorder'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {mod.actions.map((act) => {
                    const isGranted = Boolean(modulePerms[act.id]);
                    return (
                      <label
                        key={act.id}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition cursor-pointer ${
                          isGranted
                            ? 'border-brand-green/40 bg-brand-green/10 text-brand-green font-bold'
                            : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F1626] text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isGranted}
                          onChange={() => handleToggleAction(mod.id, act.id)}
                          className="rounded border-slate-300 text-brand-green focus:ring-brand-green h-4 w-4 cursor-pointer"
                        />
                        <span className="text-xs">{act.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Role Modal */}
      {isEditingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-white dark:bg-[#161E33] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl space-y-4 font-body">
            <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
              {editingRole?.id ? 'Modifier le rôle' : 'Nouveau rôle'}
            </h3>

            <div className="space-y-3">
              <Input
                label="Nom du rôle"
                value={roleDraft.role}
                onChange={(e) => setRoleDraft({ ...roleDraft, role: e.target.value })}
                required
                placeholder="Ex: Superviseur Régional"
              />
              <Input
                label="Description"
                value={roleDraft.desc}
                onChange={(e) => setRoleDraft({ ...roleDraft, desc: e.target.value })}
                placeholder="Périmètre et responsabilités..."
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Couleur d’identification</label>
                <div className="flex items-center gap-2">
                  {['#4D6AB1', '#7C3AED', '#0891B2', '#F6A020', '#56B039', '#E4483B'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setRoleDraft({ ...roleDraft, color })}
                      className={`w-7 h-7 rounded-full transition transform ${
                        roleDraft.color === color ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsEditingModal(false)}>
                Annuler
              </Button>
              <Button variant="primary" onClick={handleSaveRoleModal}>
                {editingRole?.id ? 'Enregistrer' : 'Créer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmDialog
        isOpen={!!deleteRole}
        onClose={() => setDeleteRole(null)}
        onConfirm={handleDeleteConfirm}
        title={`Supprimer le rôle « ${deleteRole?.role} » ?`}
        description="Cette action retirera ce rôle à tous les utilisateurs rattachés."
        confirmLabel="Supprimer définitivement"
        variant="danger"
      />
    </div>
  );
}
