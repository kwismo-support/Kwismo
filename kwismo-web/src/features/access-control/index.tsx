import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { useAccessControl } from './hooks/useAccessControl';
import { RolesList } from './components/RolesList';
import { PermissionsMatrix } from './components/PermissionsMatrix';
import type { RoleOut } from './services/accessControl.api';
import { toast } from '@/shared/store/toastStore';

export default function AccessControlPage() {
  const { t } = useTranslation('admin');
  const { hasPermission } = usePermissions();
  const { roles, accessRights, loading, saving, createRole, deleteRole, toggleAccessRight } = useAccessControl();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [roleToDelete, setRoleToDelete] = useState<RoleOut | null>(null);

  const canCreateRole = hasPermission('roles:create');

  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    try {
      const created = await createRole(newRoleName.trim());
      setSelectedRoleId(created.id);
      setNewRoleName('');
      setIsModalOpen(false);
    } catch {}
  };

  const handleDeleteRoleConfirm = async () => {
    if (!roleToDelete) return;
    try {
      await deleteRole(roleToDelete.id);
      if (selectedRoleId === roleToDelete.id) {
        const remaining = roles.filter((r) => r.id !== roleToDelete.id);
        setSelectedRoleId(remaining.length > 0 ? remaining[0].id : null);
      }
      setRoleToDelete(null);
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 font-body max-w-7xl mx-auto">
        <PageHeader title={t('access.title')} subtitle={t('access.subtitle')} showBreadcrumb={true} />
        <div className="flex items-center justify-center p-12 bg-white dark:bg-[#161E33] rounded-3xl border border-slate-200 dark:border-white/10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 font-body max-w-7xl mx-auto">
      <PageHeader
        title={t('access.title')}
        subtitle={t('access.subtitle')}
        showBreadcrumb={true}
        actions={
          canCreateRole
            ? [
                {
                  label: t('access.addRole'),
                  icon: 'solar:shield-user-bold',
                  variant: 'primary',
                  onClick: () => setIsModalOpen(true),
                },
              ]
            : undefined
        }
      />

      <RolesList
        roles={roles}
        selectedRoleId={selectedRoleId}
        onSelectRole={(id) => setSelectedRoleId(id)}
        onDeleteRole={(role) => setRoleToDelete(role)}
      />

      {selectedRole && (
        <PermissionsMatrix
          role={selectedRole}
          accessRights={accessRights}
          onToggleRight={toggleAccessRight}
          onSave={() => toast.success(t('access.saveMatrixSuccess'))}
          saving={saving}
        />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form
            onSubmit={handleCreateRoleSubmit}
            className="w-full max-w-md p-6 bg-white dark:bg-[#161E33] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl space-y-4 font-body"
          >
            <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
              {t('access.addRole')}
            </h3>

            <Input
              label={t('access.roleName')}
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              required
              placeholder={t('access.roleNamePlaceholder')}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" type="submit" isLoading={saving}>
                {t('common.save')}
              </Button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        onConfirm={handleDeleteRoleConfirm}
        title={t('access.deleteRoleTitle')}
        description={t('access.deleteRoleConfirm')}
        confirmLabel={t('access.deleteRole')}
        variant="danger"
      />
    </div>
  );
}
