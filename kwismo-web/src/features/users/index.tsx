import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/shared/lib/api';
import { toast } from '@/shared/store/toastStore';
import type { UserDTO } from '@/shared/mock';
import UsersTable from './components/UsersTable';
import UserDetailPanel from './components/UserDetailPanel';

export default function UsersPage() {
  const { t } = useTranslation(['admin', 'common']);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getUsers()
      .then((data) => { if (mounted) setUsers(data); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleToggleStatus = (targetUser: UserDTO) => {
    const updatedStatus = targetUser.statut === 'active' ? 'suspended' : 'active';
    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, statut: updatedStatus } : u)),
    );
    if (selectedUser?.id === targetUser.id) {
      setSelectedUser({ ...selectedUser, statut: updatedStatus });
    }
    toast.success(t('common:actions.save'));
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <div>
        <h1 className="font-title text-2xl font-bold text-slate-900 dark:text-white">
          {t('admin:users.title')}
        </h1>
      </div>

      <UsersTable
        users={users}
        isLoading={loading}
        onSelectUser={(u) => setSelectedUser(u)}
      />

      <UserDetailPanel
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
