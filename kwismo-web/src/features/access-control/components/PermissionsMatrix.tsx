import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/ui/button';
import { usePermissions } from '@/shared/hooks/usePermissions';
import type { RoleOut, AccessRightOut } from '../services/accessControl.api';
import type { PermissionCode } from '@/shared/types/access';

export interface ModuleConfig {
  id: string;
  labelKey: string;
  permissions: { code: PermissionCode; actionKey: string }[];
}

export const MODULE_PERMISSIONS: ModuleConfig[] = [
  {
    id: 'users',
    labelKey: 'access.categories.users',
    permissions: [
      { code: 'users:read', actionKey: 'access.actions.read' },
      { code: 'users:create', actionKey: 'access.actions.create' },
      { code: 'users:update', actionKey: 'access.actions.update' },
      { code: 'users:delete', actionKey: 'access.actions.delete' },
      { code: 'users:export', actionKey: 'access.actions.export' },
    ],
  },
  {
    id: 'numbers',
    labelKey: 'access.categories.numbers',
    permissions: [
      { code: 'numbers:read', actionKey: 'access.actions.read' },
      { code: 'numbers:create', actionKey: 'access.actions.create' },
      { code: 'numbers:update', actionKey: 'access.actions.update' },
      { code: 'numbers:delete', actionKey: 'access.actions.delete' },
      { code: 'numbers:verify', actionKey: 'access.actions.verify' },
      { code: 'numbers:export', actionKey: 'access.actions.export' },
    ],
  },
  {
    id: 'reports',
    labelKey: 'access.categories.reports',
    permissions: [
      { code: 'reports:read', actionKey: 'access.actions.read' },
      { code: 'reports:create', actionKey: 'access.actions.report' },
      { code: 'reports:verify', actionKey: 'access.actions.verifyReport' },
      { code: 'reports:delete', actionKey: 'access.actions.delete' },
      { code: 'reports:export', actionKey: 'access.actions.export' },
    ],
  },
  {
    id: 'partners',
    labelKey: 'access.categories.partners',
    permissions: [
      { code: 'partners:read', actionKey: 'access.actions.read' },
      { code: 'partners:create', actionKey: 'access.actions.create' },
      { code: 'partners:update', actionKey: 'access.actions.update' },
      { code: 'partners:delete', actionKey: 'access.actions.delete' },
      { code: 'affiliation:update', actionKey: 'access.actions.manageAffiliation' },
      { code: 'partners:export', actionKey: 'access.actions.export' },
    ],
  },
  {
    id: 'ussd',
    labelKey: 'access.categories.ussd',
    permissions: [
      { code: 'ussd:read', actionKey: 'access.actions.read' },
      { code: 'ussd:create', actionKey: 'access.actions.create' },
      { code: 'ussd:update', actionKey: 'access.actions.update' },
      { code: 'ussd:delete', actionKey: 'access.actions.delete' },
      { code: 'ussd:export', actionKey: 'access.actions.export' },
    ],
  },
  {
    id: 'roles',
    labelKey: 'access.categories.roles',
    permissions: [
      { code: 'roles:read', actionKey: 'access.actions.read' },
      { code: 'roles:create', actionKey: 'access.actions.create' },
      { code: 'roles:update', actionKey: 'access.actions.update' },
      { code: 'roles:delete', actionKey: 'access.actions.delete' },
    ],
  },
  {
    id: 'settings',
    labelKey: 'access.categories.settings',
    permissions: [
      { code: 'analytics:read', actionKey: 'access.actions.apiSupervision' },
      { code: 'settings:read', actionKey: 'access.actions.readSettings' },
      { code: 'settings:update', actionKey: 'access.actions.updateSettings' },
      { code: 'system:configure', actionKey: 'access.actions.configureSystem' },
    ],
  },
];

interface PermissionsMatrixProps {
  role: RoleOut;
  accessRights: AccessRightOut[];
  onToggleRight: (roleId: string, permission: PermissionCode, grant: boolean) => Promise<void>;
  onSave: () => void;
  saving: boolean;
}

export function PermissionsMatrix({ role, accessRights, onToggleRight, onSave, saving }: PermissionsMatrixProps) {
  const { t } = useTranslation('admin');
  const { hasPermission } = usePermissions();
  const canUpdatePermissions = hasPermission('roles:update');

  const isSuperAdminRole =
    role.nom_role.toLowerCase().includes('super') ||
    role.id.toLowerCase().includes('super');

  const canModify = !isSuperAdminRole && canUpdatePermissions;

  const roleRights = accessRights.filter((ar) => ar.role_id === role.id);
  const grantedPermissions = new Set(roleRights.map((ar) => ar.permission));

  const isModuleFullyGranted = (mod: ModuleConfig) => {
    if (isSuperAdminRole) return true;
    return mod.permissions.every((p) => grantedPermissions.has(p.code));
  };

  const handleToggleModule = async (mod: ModuleConfig) => {
    if (!canModify) return;
    const fullyGranted = isModuleFullyGranted(mod);
    for (const p of mod.permissions) {
      if (fullyGranted && grantedPermissions.has(p.code)) {
        await onToggleRight(role.id, p.code, false);
      } else if (!fullyGranted && !grantedPermissions.has(p.code)) {
        await onToggleRight(role.id, p.code, true);
      }
    }
  };

  return (
    <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white capitalize">
            {t('access.matrix')} « {role.nom_role} »
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{role.description || t('access.subtitle')}</p>
        </div>

        {canModify && (
          <Button variant="primary" onClick={onSave} isLoading={saving}>
            {t('access.saveMatrix')}
          </Button>
        )}
      </div>

      {isSuperAdminRole && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
          <Icon icon="solar:info-circle-bold" className="text-lg shrink-0 text-amber-500" />
          <span>
            {t('access.superAdminNotice')}
          </span>
        </div>
      )}

      <div className="space-y-4">
        {MODULE_PERMISSIONS.map((mod) => {
          const fullyGranted = isModuleFullyGranted(mod);
          return (
            <div
              key={mod.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]"
            >
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-3 mb-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {t(mod.labelKey)}
                  </h4>
                </div>

                {canModify && (
                  <button
                    onClick={() => handleToggleModule(mod)}
                    className="text-xs font-semibold text-brand-green hover:underline cursor-pointer"
                  >
                    {fullyGranted ? t('access.deselectAll') : t('access.selectAll')}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {mod.permissions.map((p) => {
                  const isGranted = isSuperAdminRole || grantedPermissions.has(p.code);
                  return (
                    <label
                      key={p.code}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition ${
                        canModify ? 'cursor-pointer' : 'cursor-default opacity-85'
                      } ${
                        isGranted
                          ? 'border-brand-green/40 bg-brand-green/10 text-brand-green font-bold'
                          : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F1626] text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isGranted}
                        disabled={!canModify}
                        onChange={(e) => canModify && onToggleRight(role.id, p.code, e.target.checked)}
                        className="rounded border-slate-300 text-brand-green focus:ring-brand-green h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <span className="text-xs">{t(p.actionKey)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
