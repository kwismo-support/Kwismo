import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader, ConfirmDialog } from '@/shared/components';
import UsersTable from './components/UsersTable';
import { useUsers } from './hooks/useUsers';
import { usePermissions } from '@/shared/hooks/usePermissions';
import type { UserItem } from './services/users.api';

export default function UsersPage() {
  const { t } = useTranslation(['admin', 'common']);
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const {
    users,
    total,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    updateStatus,
    deleteUser,
  } = useUsers();

  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [userToToggle, setUserToToggle] = useState<UserItem | null>(null);

  const handleConfirmToggleStatus = async () => {
    if (!userToToggle) return;
    const currentActive = userToToggle.statut === 'active' || userToToggle.statut === 'Actif';
    const nextStatus = currentActive ? 'suspended' : 'active';
    await updateStatus(userToToggle.id, nextStatus);
    setUserToToggle(null);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    await deleteUser(userToDelete.id);
    setUserToDelete(null);
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <PageHeader
        title={t('admin:users.title')}
        subtitle={t('admin:users.subtitle')}
        rolePerspective="ADMIN"
        showBreadcrumb={true}
        actions={
          hasPermission('users:create')
            ? [
                {
                  label: t('admin:users.newUserButton'),
                  icon: 'solar:user-plus-bold',
                  variant: 'primary',
                  onClick: () => navigate('/app/users/new'),
                },
              ]
            : []
        }
      />

      <UsersTable
        users={users}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        isLoading={loading}
        onSelectUser={(u) => navigate(`/app/users/${u.id}`)}
        onToggleStatus={(u) => setUserToToggle(u)}
        onDeleteUser={(u) => setUserToDelete(u)}
      />

      <ConfirmDialog
        isOpen={!!userToToggle}
        onClose={() => setUserToToggle(null)}
        onConfirm={handleConfirmToggleStatus}
        title={
          userToToggle?.statut === 'active' || userToToggle?.statut === 'Actif'
            ? t('admin:users.suspendConfirmTitle')
            : t('admin:users.activateConfirmTitle')
        }
        description={`${t('admin:users.toggleConfirmDesc')} ${userToToggle?.prenom || ''} ${userToToggle?.nom || ''} (${userToToggle?.email}) ?`}
        confirmLabel={t('common:actions.confirm')}
        variant={userToToggle?.statut === 'active' || userToToggle?.statut === 'Actif' ? 'warning' : 'success'}
      />

      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDeleteUser}
        title={t('admin:users.deleteConfirmTitle')}
        description={`${t('admin:users.deleteConfirmDesc')} ${userToDelete?.prenom || ''} ${userToDelete?.nom || ''} ?`}
        confirmLabel={t('common:actions.delete')}
        variant="danger"
      />
    </div>
  );
}
