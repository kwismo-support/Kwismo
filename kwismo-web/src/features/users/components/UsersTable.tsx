import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { FilterBar } from '@/shared/components/FilterBar';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { UserAvatar } from '@/shared/ui/avatar';
import { KpiCard } from '@/shared/components/KpiCard';
import { TablePagination } from '@/shared/components/TableWrapper';
import { toast } from '@/shared/store/toastStore';
import { usePermissions } from '@/shared/hooks/usePermissions';
import type { UserItem } from '../services/users.api';

interface UsersTableProps {
  users: UserItem[];
  isLoading?: boolean;
  onSelectUser: (user: UserItem) => void;
  onAddUser?: () => void;
  onToggleStatus?: (user: UserItem) => void;
  onDeleteUser?: (user: UserItem) => void;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export default function UsersTable({
  users,
  isLoading = false,
  onSelectUser,
  onToggleStatus,
  onDeleteUser,
  total,
  page = 1,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
}: UsersTableProps) {
  const { t } = useTranslation(['admin', 'common']);
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const fullName = `${u.prenom} ${u.nom}`.toLowerCase();
      const matchesSearch = !search || fullName.includes(q) || u.email.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'ALL' || u.statut.toLowerCase() === statusFilter.toLowerCase();
      const matchesRole = roleFilter === 'ALL' || (u.role && u.role.toLowerCase() === roleFilter.toLowerCase());
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, search, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalCount = total ?? users.length;
    const active = users.filter((u) => u.statut === 'active' || u.statut === 'Actif').length;
    const suspended = users.filter((u) => u.statut === 'suspended' || u.statut === 'Suspendu').length;
    const partners = users.filter((u) => u.role && (u.role.toLowerCase().includes('partner') || u.role.toLowerCase().includes('partenaire'))).length;
    return { total: totalCount, active, suspended, partners };
  }, [users, total]);

  const totalPages = Math.ceil((total ?? filteredUsers.length) / pageSize);

  const columns: Column<UserItem>[] = [
    {
      key: 'user',
      header: t('admin:users.title'),
      sortable: true,
      cell: (user) => {
        const r = typeof user.role === 'string' ? user.role.toLowerCase() : 'user';
        const roleRing = r.includes('admin') ? 'admin' : r.includes('partner') || r.includes('partenaire') ? 'partner' : 'user';

        return (
          <div className="flex items-center gap-3">
            <UserAvatar
              name={`${user.prenom} ${user.nom}`}
              roleRing={roleRing}
              size="md"
              statusDot={user.statut === 'active' || user.statut === 'Actif' ? 'active' : 'inactive'}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {user.prenom} {user.nom}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono block">{user.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      header: t('admin:users.role'),
      sortable: true,
      cell: (user) => (
        <StatusBadge status={typeof user.role === 'string' ? user.role : 'user'} size="xs" showDot={false} />
      ),
    },
    {
      key: 'numeros',
      header: t('admin:users.attachedNumbers'),
      align: 'center',
      cell: (user) => (
        <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200">
          {user.nombre_numeros ?? user.numeros?.length ?? 0}
        </span>
      ),
    },
    {
      key: 'statut',
      header: t('common:status'),
      sortable: true,
      cell: (user) => <StatusBadge status={user.statut} size="sm" showDot={false} />,
    },
    {
      key: 'date_inscription',
      header: t('admin:users.registeredAt'),
      sortable: true,
      cell: (user) => (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-mono">
          {user.date_inscription
            ? new Date(user.date_inscription).toLocaleDateString()
            : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common:actions.label'),
      align: 'right',
      cell: (user) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onSelectUser(user)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-brand-navy hover:text-white dark:hover:bg-brand-orange dark:hover:text-brand-navy transition cursor-pointer"
          >
            <Icon icon="solar:eye-bold" className="text-sm" />
          </button>

          {hasPermission('users:update') && onToggleStatus && (
            <button
              onClick={() => onToggleStatus(user)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition cursor-pointer"
            >
              <Icon icon="solar:user-block-bold" className="text-sm" />
            </button>
          )}

          {hasPermission('users:delete') && onDeleteUser && (
            <button
              onClick={() => onDeleteUser(user)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition cursor-pointer"
            >
              <Icon icon="solar:trash-bin-trash-bold" className="text-sm" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full font-body">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title={t('admin:users.kpis.total')} value={stats.total} isLoading={isLoading} />
        <KpiCard title={t('admin:users.kpis.active')} value={stats.active} isLoading={isLoading} />
        <KpiCard title={t('admin:users.kpis.suspended')} value={stats.suspended} badgeVariant="warning" isLoading={isLoading} />
        <KpiCard title={t('admin:users.kpis.partners')} value={stats.partners} isLoading={isLoading} />
      </div>

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('admin:users.searchPlaceholder')}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onResetFilters={() => {
          setSearch('');
          setRoleFilter('ALL');
          setStatusFilter('ALL');
        }}
        onExport={hasPermission('users:export') ? () => toast.success(t('users.toasts.exportInitiated')) : undefined}
        selects={[
          {
            id: 'role',
            value: roleFilter,
            onChange: setRoleFilter,
            icon: 'solar:shield-user-linear',
            options: [
              { label: t('admin:users.filters.allRoles'), value: 'ALL' },
              { label: t('admin:users.filters.admin'), value: 'admin' },
              { label: t('admin:users.filters.partner'), value: 'partner' },
              { label: t('admin:users.filters.user'), value: 'user' },
            ],
          },
          {
            id: 'status',
            value: statusFilter,
            onChange: setStatusFilter,
            icon: 'solar:check-read-linear',
            options: [
              { label: t('admin:users.filters.allStatuses'), value: 'ALL' },
              { label: t('admin:users.status.active'), value: 'active' },
              { label: t('admin:users.status.suspended'), value: 'suspended' },
            ],
          },
        ]}
      />

      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={filteredUsers}
          isLoading={isLoading}
          getRowKey={(user) => user.id}
          pageSize={pageSize}
          selectable={true}
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          onRowClick={(user) => onSelectUser(user)}
          emptyTitle={t('admin:users.emptyTitle')}
          emptyDesc={t('admin:users.emptyDesc')}
          emptyIcon="solar:user-block-bold-duotone"
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => onSelectUser(user)}
                className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between font-body"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <StatusBadge status={typeof user.role === 'string' ? user.role : 'user'} size="xs" showDot={false} />
                    <StatusBadge status={user.statut} size="xs" showDot={false} />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <UserAvatar
                      name={`${user.prenom} ${user.nom}`}
                      roleRing={user.role && user.role.toLowerCase().includes('admin') ? 'admin' : user.role && user.role.toLowerCase().includes('partner') ? 'partner' : 'user'}
                      size="md"
                    />
                    <div>
                      <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
                        {user.prenom} {user.nom}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>{t('admin:users.attachedNumbers')}: {user.nombre_numeros ?? user.numeros?.length ?? 0}</span>
                  <Icon icon="solar:alt-arrow-right-linear" className="text-base" />
                </div>
              </div>
            ))}
          </div>

          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={total ?? filteredUsers.length}
            onPageChange={onPageChange || (() => {})}
            onPageSizeChange={onPageSizeChange || (() => {})}
          />
        </div>
      )}
    </div>
  );
}
