// Access control management page rendering role cards and permissions matrix with RBAC rules.
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/shared/lib/api';
import type { RoleDTO, PermissionDTO } from '@/shared/mock';
import RolesList from './components/RolesList';
import PermissionsMatrix from './components/PermissionsMatrix';

export default function AccessControlPage() {
  const { t } = useTranslation(['admin']);
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [rData, pData] = await Promise.all([
          api.getRoles(),
          api.getPermissions(),
        ]);
        setRoles(rData);
        setPermissions(pData);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <div>
        <h1 className="font-title text-2xl font-bold text-slate-900 dark:text-white">
          {t('admin:access.title')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('admin:access.subtitle')}
        </p>
      </div>

      <RolesList roles={roles} isLoading={isLoading} />
      <PermissionsMatrix permissions={permissions} isLoading={isLoading} />
    </div>
  );
}

