import { useState } from 'react';
import { Icon } from '@iconify/react';
import { PERM_MODULES, MOCK_ROLES, type PermissionDTO } from '@/shared/mock';
import { TableWrapper } from '@/shared/components/TableWrapper';

interface PermissionsMatrixProps {
  permissions?: PermissionDTO[];
  isLoading?: boolean;
}

export default function PermissionsMatrix({ isLoading = false }: PermissionsMatrixProps) {
  const [activeRole, setActiveRole] = useState('Admin');

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm animate-pulse font-body">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-48 mb-2" />
        <div className="h-64 rounded-xl bg-slate-100 dark:bg-white/5 mt-4" />
      </div>
    );
  }

  return (
    <TableWrapper
      title="Matrice Globale des Permissions & Privilèges"
      subtitle="Affectation des droits d'accès par module système pour chaque rôle"
    >
      <div className="p-4 bg-slate-50/50 dark:bg-brand-darkBg/40 border-b border-slate-200 dark:border-white/10 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
          Rôle sélectionné:
        </span>
        {MOCK_ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => setActiveRole(role.nomRole)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeRole === role.nomRole
                ? 'bg-brand-navy text-white dark:bg-brand-orange dark:text-brand-navy shadow-xs'
                : 'bg-white dark:bg-brand-navy text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100'
            }`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: role.color || '#4D6AB1' }}
            />
            <span>{role.nomRole}</span>
          </button>
        ))}
      </div>

      <table className="w-full text-left border-collapse font-body">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-brand-darkBg/60 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <th className="py-3.5 px-6">Module Système</th>
            <th className="py-3.5 px-6">Description</th>
            <th className="py-3.5 px-6">Actions Autorisées ({activeRole})</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
          {PERM_MODULES.map((mod) => (
            <tr key={mod.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition">
              <td className="py-4 px-6 font-title font-bold text-sm text-slate-900 dark:text-white">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:shield-keyhole-bold-duotone" className="text-brand-orange text-base" />
                  <span>{mod.label}</span>
                </div>
              </td>
              <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                {mod.desc}
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center gap-2 flex-wrap">
                  {mod.actions.map((act) => {
                    const isGranted = activeRole === 'Admin' || (activeRole === 'Partenaire' && act.id === 'view');

                    return (
                      <span
                        key={act.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${
                          isGranted
                            ? act.critique
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                              : 'bg-brand-green/10 text-brand-green border-brand-green/20'
                            : 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-600 border-transparent opacity-60'
                        }`}
                      >
                        <Icon
                          icon={isGranted ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                          className="text-sm"
                        />
                        <span>{act.label}</span>
                        {act.critique && <span className="text-[9px] uppercase font-bold text-rose-500">(Critique)</span>}
                      </span>
                    );
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
}
