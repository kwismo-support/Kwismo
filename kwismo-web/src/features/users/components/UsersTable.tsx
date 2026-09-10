import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import type { UserDTO } from '@/shared/mock';

interface UsersTableProps {
  users: UserDTO[];
  isLoading?: boolean;
  onSelectUser: (user: UserDTO) => void;
  onAddUser?: () => void;
}

export default function UsersTable({ users, isLoading = false, onSelectUser, onAddUser }: UsersTableProps) {
  const { t } = useTranslation(['admin', 'common']);
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.nom.toLowerCase().includes(search.toLowerCase()) ||
      u.prenom.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: Column<UserDTO>[] = [
    {
      key: 'user',
      header: t('admin:users.title'),
      sortable: true,
      cell: (user) => (
        <div className="flex flex-col font-body">
          <span className="font-semibold text-slate-900 dark:text-white">
            {user.prenom} {user.nom}
          </span>
          <span className="text-xs text-slate-400">{user.email}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: t('admin:users.role'),
      sortable: true,
      cell: (user) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
          user.role.nomRole === 'admin'
            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
            : user.role.nomRole === 'partner'
            ? 'bg-brand-orange/10 text-brand-orange'
            : 'bg-slate-500/10 text-slate-600 dark:text-slate-300'
        }`}>
          {user.role.nomRole}
        </span>
      ),
    },
    {
      key: 'statut',
      header: t('common:status'),
      sortable: true,
      cell: (user) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
          user.statut === 'active'
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
        }`}>
          {t(`admin:users.status.${user.statut}`)}
        </span>
      ),
    },
    {
      key: 'dateInscription',
      header: t('admin:users.registeredAt'),
      sortable: true,
      cell: (user) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {new Date(user.dateInscription).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common:actions.label'),
      cell: (user) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="xs"
            variant="ghost"
            leftIcon="solar:eye-bold"
            onClick={() => onSelectUser(user)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 w-full font-body">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-xs">
          <Input
            sizeVariant="sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common:search')}
            leftIcon="solar:magnifer-linear"
          />
        </div>

        {onAddUser && (
          <Button
            size="sm"
            variant="secondary"
            leftIcon="solar:user-plus-bold"
            onClick={onAddUser}
          >
            {t('common:add')}
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        isLoading={isLoading}
        getRowKey={(user) => user.id}
        pageSize={10}
      />
    </div>
  );
}
