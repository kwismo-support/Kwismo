import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { FilterBar } from '@/shared/components/FilterBar';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { UserAvatar } from '@/shared/ui/avatar';
import { KpiCard } from '@/shared/components/KpiCard';
import { TablePagination } from '@/shared/components/TableWrapper';
import type { UserDTO } from '@/shared/mock';

interface UsersTableProps {
  users: UserDTO[];
  isLoading?: boolean;
  onSelectUser: (user: UserDTO) => void;
  onAddUser?: () => void;
  onToggleStatus?: (user: UserDTO) => void;
  onDeleteUser?: (user: UserDTO) => void;
}

export default function UsersTable({
  users,
  isLoading = false,
  onSelectUser,
  onToggleStatus,
  onDeleteUser,
}: UsersTableProps) {
  const { t } = useTranslation(['admin', 'common']);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const fullName = `${u.prenom} ${u.nom}`.toLowerCase();
      const matchesSearch =
        fullName.includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === 'ALL' || u.role.nomRole.toUpperCase() === roleFilter.toUpperCase();

      const matchesStatus =
        statusFilter === 'ALL' || u.statut.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const paginatedGridData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.statut === 'Actif' || u.statut === 'active').length;
    const admins = users.filter((u) => u.role.nomRole.toLowerCase() === 'admin').length;
    const partners = users.filter((u) => u.role.nomRole.toLowerCase() === 'partenaire' || u.role.nomRole.toLowerCase() === 'partner').length;
    return { total, active, admins, partners };
  }, [users]);

  const columns: Column<UserDTO>[] = [
    {
      key: 'user',
      header: t('admin:users.title', 'Utilisateur & Email'),
      sortable: true,
      cell: (user) => {
        const role = user.role.nomRole.toLowerCase();
        const roleRing = role === 'admin' ? 'admin' : role === 'partenaire' || role === 'partner' ? 'partner' : 'user';

        return (
          <div className="flex items-center gap-3">
            <UserAvatar
              name={`${user.prenom} ${user.nom}`}
              roleRing={roleRing}
              size="md"
              statusDot={user.statut === 'Actif' || user.statut === 'active' ? 'active' : 'inactive'}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {user.prenom} {user.nom}
                </span>
                {user.emailVerifie && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Vérifié
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 font-mono block">{user.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      header: t('admin:users.role', 'Rôle'),
      sortable: true,
      cell: (user) => <StatusBadge status={user.role.nomRole} size="xs" showDot={false} />,
    },
    {
      key: 'numeros',
      header: 'Numéros rattachés',
      align: 'center',
      cell: (user) => (
        <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200">
          {user.numeros?.length || 0} numéro(s)
        </span>
      ),
    },
    {
      key: 'statut',
      header: t('common:status', 'Statut'),
      sortable: true,
      cell: (user) => <StatusBadge status={user.statut} size="sm" showDot={false} />,
    },
    {
      key: 'dateInscription',
      header: t('admin:users.registeredAt', 'Inscrit le'),
      sortable: true,
      cell: (user) => (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-mono">
          {user.dateInscription.includes('T')
            ? new Date(user.dateInscription).toLocaleDateString('fr-FR')
            : user.dateInscription}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common:actions.label', 'Actions'),
      align: 'right',
      cell: (user) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onSelectUser(user)}
            title="Inspecter l'utilisateur"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-brand-navy hover:text-white dark:hover:bg-brand-orange dark:hover:text-brand-navy transition cursor-pointer"
          >
            <Icon icon="solar:eye-bold" className="text-sm" />
          </button>

          <button
            onClick={() => onSelectUser(user)}
            title="Éditer l'utilisateur"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-brand-blue dark:text-blue-400 hover:bg-brand-blue hover:text-white transition cursor-pointer"
          >
            <Icon icon="solar:pen-bold" className="text-sm" />
          </button>

          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(user)}
              title={user.statut === 'Actif' || user.statut === 'active' ? 'Suspendre' : 'Activer'}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition cursor-pointer"
            >
              <Icon icon="solar:user-block-bold" className="text-sm" />
            </button>
          )}

          {onDeleteUser && (
            <button
              onClick={() => onDeleteUser(user)}
              title="Supprimer l'utilisateur"
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
        <KpiCard title="Total Comptes" value={stats.total} isLoading={isLoading} />
        <KpiCard title="Comptes Actifs" value={stats.active} isLoading={isLoading} />
        <KpiCard title="Administrateurs" value={stats.admins} isLoading={isLoading} />
        <KpiCard title="Comptes Partenaires" value={stats.partners} isLoading={isLoading} />
      </div>

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par nom, prénom, email..."
        countryValue={countryFilter}
        onCountryChange={setCountryFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onResetFilters={() => {
          setSearch('');
          setRoleFilter('ALL');
          setCountryFilter('ALL');
          setStatusFilter('ALL');
        }}
        onExport={() => alert('Export CSV des utilisateurs...')}
        selects={[
          {
            id: 'role',
            value: roleFilter,
            onChange: setRoleFilter,
            icon: 'solar:shield-user-linear',
            options: [
              { label: 'Tous les rôles', value: 'ALL' },
              { label: 'Admin', value: 'ADMIN' },
              { label: 'Partenaire', value: 'PARTENAIRE' },
              { label: 'Analyste', value: 'ANALYSTE' },
              { label: 'Support', value: 'SUPPORT' },
            ],
          },
          {
            id: 'status',
            value: statusFilter,
            onChange: setStatusFilter,
            icon: 'solar:check-read-linear',
            options: [
              { label: 'Tous les statuts', value: 'ALL' },
              { label: 'Actifs', value: 'ACTIF' },
              { label: 'Suspendus', value: 'SUSPENDU' },
              { label: 'Inactifs', value: 'INACTIF' },
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
          pageSize={10}
          selectable={true}
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          onRowClick={(user) => onSelectUser(user)}
          emptyTitle="Aucun utilisateur trouvé"
          emptyDesc="Modifiez vos critères de recherche ou ajoutez un nouvel utilisateur."
          emptyIcon="solar:user-block-bold-duotone"
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedGridData.map((user) => (
              <div
                key={user.id}
                onClick={() => onSelectUser(user)}
                className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between font-body"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <StatusBadge status={user.role.nomRole} size="xs" showDot={false} />
                    <StatusBadge status={user.statut} size="xs" showDot={false} />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <UserAvatar
                      name={`${user.prenom} ${user.nom}`}
                      roleRing={user.role.nomRole.toLowerCase().includes('admin') ? 'admin' : user.role.nomRole.toLowerCase().includes('partenaire') ? 'partner' : 'user'}
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
                  <span>Numéros rattachés : {user.numeros?.length || 0}</span>
                  <Icon icon="solar:alt-arrow-right-linear" className="text-base" />
                </div>
              </div>
            ))}
          </div>

          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredUsers.length}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
