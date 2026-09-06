// Roles card list displaying application security roles and assigned user counts.
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/ui/button';
import type { RoleDTO } from '@/shared/mock';

interface RolesListProps {
  roles: RoleDTO[];
  isLoading?: boolean;
  onAddRole?: () => void;
}

export default function RolesList({ roles, isLoading = false, onAddRole }: RolesListProps) {
  const { t } = useTranslation(['admin', 'common']);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm animate-pulse font-body">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-48 mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm font-body">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
            {t('admin:access.roles')}
          </h3>
        </div>
        {onAddRole && (
          <Button size="xs" variant="primary" leftIcon="solar:add-circle-bold" onClick={onAddRole}>
            {t('admin:access.addRole')}
          </Button>
        )}
      </div>

      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div key={role.id} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-title text-sm font-bold text-slate-900 dark:text-white font-mono uppercase">
                  {role.nomRole}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-green/10 text-brand-green font-mono">
                  {role.userCount}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">{role.description}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Icon icon="solar:user-bold" className="text-brand-orange" />
                <span>{role.userCount}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
