import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/shared/hooks/usePermissions';
import type { RoleOut } from '../services/accessControl.api';

interface RolesListProps {
  roles: RoleOut[];
  selectedRoleId: string | null;
  onSelectRole: (roleId: string) => void;
  onDeleteRole: (role: RoleOut) => void;
}

export function RolesList({ roles, selectedRoleId, onSelectRole, onDeleteRole }: RolesListProps) {
  const { t } = useTranslation('admin');
  const { hasPermission } = usePermissions();
  const canDeleteRole = hasPermission('roles:delete');

  const getRoleColor = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('admin')) return '#4D6AB1';
    if (lower.includes('partner') || lower.includes('partenaire')) return '#7C3AED';
    if (lower.includes('user') || lower.includes('utilisateur')) return '#0891B2';
    return '#F6A020';
  };

  const isSystemRole = (name: string) => {
    const lower = name.toLowerCase();
    return lower === 'admin' || lower === 'partner' || lower === 'user' || lower === 'super_admin';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {roles.map((r) => {
        const active = r.id === selectedRoleId;
        const color = getRoleColor(r.nom_role);
        const system = isSystemRole(r.nom_role);

        return (
          <div
            key={r.id}
            onClick={() => onSelectRole(r.id)}
            className={`p-5 rounded-3xl border transition cursor-pointer flex flex-col justify-between ${
              active
                ? 'border-brand-navy dark:border-brand-orange bg-white dark:bg-[#161E33] shadow-md ring-2 ring-brand-navy/20 dark:ring-brand-orange/20'
                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <h3 className="font-title text-base font-bold text-slate-900 dark:text-white capitalize">
                    {r.nom_role}
                  </h3>
                </div>
                {system ? (
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
                {r.description || t('access.roles')}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">{t('access.roles')}</span>
              <div className="flex items-center gap-1">
                {!system && canDeleteRole ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRole(r);
                    }}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Icon icon="solar:trash-bin-trash-bold" className="text-sm" />
                  </button>
                ) : (
                  <span className="p-1 text-slate-300 dark:text-slate-600 cursor-not-allowed">
                    <Icon icon="solar:lock-bold" className="text-sm" />
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
