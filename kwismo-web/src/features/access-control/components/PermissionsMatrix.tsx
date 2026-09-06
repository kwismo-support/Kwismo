// RBAC permissions matrix component showing role permissions mapping.
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import type { PermissionDTO } from '@/shared/mock';

interface PermissionsMatrixProps {
  permissions: PermissionDTO[];
  isLoading?: boolean;
}

export default function PermissionsMatrix({ permissions, isLoading = false }: PermissionsMatrixProps) {
  const { t } = useTranslation(['admin', 'common']);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm animate-pulse font-body">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-48 mb-2" />
        <div className="h-48 rounded-xl bg-slate-100 dark:bg-white/5 mt-4" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm font-body">
      <div>
        <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
          {t('admin:access.matrix')}
        </h3>
      </div>

      <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="p-3.5">{t('admin:access.permissions')}</th>
              <th className="p-3.5 text-center">{t('admin:access.roleAdmin')}</th>
              <th className="p-3.5 text-center">{t('admin:access.rolePartner')}</th>
              <th className="p-3.5 text-center">{t('admin:access.roleUser')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-xs">
            {permissions.map((perm) => {
              const hasAdmin = perm.roles.includes('admin');
              const hasPartner = perm.roles.includes('partner');
              const hasUser = perm.roles.includes('user');

              return (
                <tr key={perm.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition">
                  <td className="p-3.5 font-medium text-slate-900 dark:text-white">
                    <span className="font-semibold block">{perm.module} : {perm.description}</span>
                    <span className="text-[11px] font-mono text-slate-400">{perm.code}</span>
                  </td>
                  <td className="p-3.5 text-center">
                    <Icon icon={hasAdmin ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} className={`mx-auto text-lg ${hasAdmin ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                  </td>
                  <td className="p-3.5 text-center">
                    <Icon icon={hasPartner ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} className={`mx-auto text-lg ${hasPartner ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                  </td>
                  <td className="p-3.5 text-center">
                    <Icon icon={hasUser ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} className={`mx-auto text-lg ${hasUser ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

