import { Icon } from '@iconify/react';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { AvatarGroup } from '@/shared/ui/avatar';
import type { RoleDTO } from '@/shared/mock';

interface RolesListProps {
  roles: RoleDTO[];
  isLoading?: boolean;
  onAddRole?: () => void;
}

export default function RolesList({ roles, isLoading = false, onAddRole }: RolesListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-body">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 font-body">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
            Rôles &amp; Privilèges Administrateurs
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Groupes d'utilisateurs et affectations de règles de sécurité
          </p>
        </div>

        {onAddRole && (
          <button
            onClick={onAddRole}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-navy dark:bg-brand-orange text-white dark:text-brand-navy text-xs font-semibold hover:opacity-90 transition shadow-sm cursor-pointer"
          >
            <Icon icon="solar:shield-plus-bold" className="text-base" />
            <span>Créer un rôle</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role) => {
          const mockUsers = Array.from({ length: role.userCount }).map((_, i) => ({
            name: `User ${i + 1}`,
            roleRing: role.nomRole.toLowerCase() === 'admin' ? ('admin' as const) : ('user' as const),
          }));

          return (
            <div
              key={role.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <StatusBadge status={role.nomRole} size="xs" showDot={false} />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                    {role.userCount} membre(s)
                  </span>
                </div>

                <h4 className="font-title text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                  {role.nomRole}
                </h4>

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {role.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <AvatarGroup users={mockUsers} max={3} size="xs" />

                <button className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1 cursor-pointer">
                  <span>Configurer</span>
                  <Icon icon="solar:alt-arrow-right-linear" className="text-xs" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
