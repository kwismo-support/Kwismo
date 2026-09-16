import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { FilterBar } from '@/shared/components/FilterBar';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { UserAvatar } from '@/shared/ui/avatar';
import { usePermissions } from '@/shared/hooks/usePermissions';
import type { PartnerRequestItem } from '../services/partnerRequestsStore';

interface PendingRequestsTableProps {
  requests: PartnerRequestItem[];
  onValidate: (request: PartnerRequestItem) => void;
  onReject: (request: PartnerRequestItem) => void;
}

export default function PendingRequestsTable({
  requests,
  onValidate,
  onReject,
}: PendingRequestsTableProps) {
  const { t } = useTranslation(['admin', 'common']);
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        r.nomEntreprise.toLowerCase().includes(q) ||
        r.nomContact.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q);

      const matchesType =
        typeFilter === 'ALL' || r.typePartenariat.toUpperCase() === typeFilter.toUpperCase();

      const matchesStatus =
        statusFilter === 'ALL' || r.statut.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [requests, search, typeFilter, statusFilter]);

  const columns: Column<PartnerRequestItem>[] = [
    {
      key: 'nomEntreprise',
      header: t('admin:partners.company'),
      sortable: true,
      cell: (req) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={req.nomEntreprise} roleRing="partner" size="md" />
          <div>
            <span className="font-title font-bold text-sm text-slate-900 dark:text-white block">
              {req.nomEntreprise}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {req.dateDemande ? new Date(req.dateDemande).toLocaleDateString() : '—'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'typePartenariat',
      header: t('admin:partners.type'),
      sortable: true,
      cell: (req) => <StatusBadge status={req.typePartenariat} size="xs" showDot={false} />,
    },
    {
      key: 'nomContact',
      header: t('admin:partners.contactPerson'),
      cell: (req) => (
        <div className="flex flex-col text-xs font-body">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {req.prenomContact} {req.nomContact}
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            {req.email} • {req.telephone}
          </span>
        </div>
      ),
    },
    {
      key: 'statut',
      header: t('common:status'),
      sortable: true,
      cell: (req) => (
        <StatusBadge
          status={req.statut === 'pending' ? 'PENDING' : req.statut === 'validated' ? 'APPROVED' : 'REJECTED'}
          size="sm"
          showDot={true}
        />
      ),
    },
    {
      key: 'actions',
      header: t('common:actions.label'),
      align: 'right',
      cell: (req) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          {req.statut === 'pending' && hasPermission('partners:create') ? (
            <>
              <button
                onClick={() => onValidate(req)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-green text-white text-xs font-bold hover:bg-emerald-600 transition shadow-xs cursor-pointer"
              >
                <Icon icon="solar:check-circle-bold" className="text-sm" />
                <span>{t('admin:partners.validate')}</span>
              </button>
              <button
                onClick={() => onReject(req)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition shadow-xs cursor-pointer"
              >
                <Icon icon="solar:close-circle-bold" className="text-sm" />
                <span>{t('admin:partners.reject')}</span>
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-400 font-mono font-bold">
              {req.statut === 'validated' ? t('admin:partners.configured') : t('admin:partners.rejected')}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full font-body">
      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('admin:partners.searchPlaceholder')}
        onResetFilters={() => {
          setSearch('');
          setTypeFilter('ALL');
          setStatusFilter('ALL');
        }}
        selects={[
          {
            id: 'type',
            value: typeFilter,
            onChange: setTypeFilter,
            icon: 'solar:widget-linear',
            options: [
              { label: t('admin:partners.filters.allTypes'), value: 'ALL' },
              { label: t('admin:partners.filters.telco'), value: 'TELCO' },
              { label: t('admin:partners.filters.bank'), value: 'BANK' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        getRowKey={(req) => req.id}
        pageSize={10}
        emptyTitle={t('admin:partners.emptyRequestsTitle')}
        emptyDesc={t('admin:partners.emptyRequestsDesc')}
        emptyIcon="solar:clipboard-check-bold-duotone"
      />
    </div>
  );
}
