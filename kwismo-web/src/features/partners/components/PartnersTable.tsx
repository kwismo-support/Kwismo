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
import type { PartnerItem } from '../services/partners.api';

interface PartnersTableProps {
  partners: PartnerItem[];
  isLoading?: boolean;
  onEditPartner: (partner: PartnerItem) => void;
  onAddPartner?: () => void;
  onDeletePartner?: (partner: PartnerItem) => void;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export default function PartnersTable({
  partners,
  isLoading = false,
  onEditPartner,
  onDeletePartner,
  total,
  page = 1,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
}: PartnersTableProps) {
  const { t } = useTranslation(['admin', 'common']);
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        p.nom_entreprise.toLowerCase().includes(q) ||
        p.type_partenariat.toLowerCase().includes(q);

      const matchesType =
        typeFilter === 'ALL' || p.type_partenariat.toUpperCase() === typeFilter.toUpperCase();

      return matchesSearch && matchesType;
    });
  }, [partners, search, typeFilter]);

  const stats = useMemo(() => {
    const totalCount = total ?? partners.length;
    const telco = partners.filter((p) => p.type_partenariat.toLowerCase().includes('opérateur') || p.type_partenariat.toLowerCase().includes('telco')).length;
    const bank = partners.filter((p) => p.type_partenariat.toLowerCase().includes('banque') || p.type_partenariat.toLowerCase().includes('bank') || p.type_partenariat.toLowerCase().includes('fintech')).length;
    return { total: totalCount, telco, bank };
  }, [partners, total]);

  const totalPages = Math.ceil((total ?? filteredPartners.length) / pageSize) || 1;

  const columns: Column<PartnerItem>[] = [
    {
      key: 'nom_entreprise',
      header: t('admin:partners.name'),
      sortable: true,
      cell: (partner) => (
        <div className="flex items-center gap-3">
          <UserAvatar
            name={partner.nom_entreprise}
            roleRing="partner"
            size="md"
          />
          <div>
            <span className="font-title font-bold text-sm text-slate-900 dark:text-white block">
              {partner.nom_entreprise}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'type_partenariat',
      header: t('admin:partners.type'),
      sortable: true,
      cell: (partner) => (
        <StatusBadge
          status={partner.type_partenariat}
          size="xs"
          showDot={false}
          className="uppercase font-mono font-bold"
        />
      ),
    },
    {
      key: 'date_adhesion',
      header: t('admin:partners.adhesionDate'),
      sortable: true,
      cell: (partner) => (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-mono">
          {partner.date_adhesion ? new Date(partner.date_adhesion).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common:actions.label'),
      align: 'right',
      cell: (partner) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEditPartner(partner)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-brand-navy hover:text-white dark:hover:bg-brand-orange dark:hover:text-brand-navy transition cursor-pointer"
          >
            <Icon icon="solar:eye-bold" className="text-sm" />
          </button>

          {hasPermission('partners:delete') && onDeletePartner && (
            <button
              onClick={() => onDeletePartner(partner)}
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title={t('admin:partners.kpis.total')} value={stats.total} isLoading={isLoading} />
        <KpiCard title={t('admin:partners.kpis.telco')} value={stats.telco} isLoading={isLoading} />
        <KpiCard title={t('admin:partners.kpis.bank')} value={stats.bank} isLoading={isLoading} />
      </div>

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('admin:partners.searchPlaceholder')}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onResetFilters={() => {
          setSearch('');
          setTypeFilter('ALL');
        }}
        onExport={hasPermission('partners:export') ? () => toast.success(t('partners.toasts.exportInitiated')) : undefined}
        selects={[
          {
            id: 'type',
            value: typeFilter,
            onChange: setTypeFilter,
            icon: 'solar:widget-linear',
            options: [
              { label: t('admin:partners.filters.allTypes'), value: 'ALL' },
              ...Array.from(new Set(partners.map((p) => p.type_partenariat).filter(Boolean))).map((typ) => ({
                label: typ,
                value: typ.toUpperCase(),
              })),
            ],
          },
        ]}
      />

      {viewMode === 'grid' ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPartners.map((partner) => (
              <div
                key={partner.id}
                onClick={() => onEditPartner(partner)}
                className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm flex flex-col justify-between hover:shadow-md transition cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <StatusBadge status={partner.type_partenariat} size="xs" showDot={false} />
                    <span className="text-xs font-mono text-slate-400">
                      {partner.date_adhesion ? new Date(partner.date_adhesion).toLocaleDateString() : '—'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <UserAvatar name={partner.nom_entreprise} roleRing="partner" size="md" />
                    <div className="min-w-0">
                      <h4 className="font-title text-sm font-bold text-slate-900 dark:text-white truncate">
                        {partner.nom_entreprise}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPartner(partner);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-semibold hover:bg-brand-navy hover:text-white transition"
                  >
                    {t('common:details')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total ?? filteredPartners.length}
            pageSize={pageSize}
            onPageChange={onPageChange || (() => {})}
            onPageSizeChange={onPageSizeChange || (() => {})}
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredPartners}
          isLoading={isLoading}
          getRowKey={(partner) => partner.id}
          pageSize={pageSize}
          selectable={true}
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          onRowClick={(partner) => onEditPartner(partner)}
          emptyTitle={t('admin:partners.emptyTitle')}
          emptyDesc={t('admin:partners.emptyDesc')}
          emptyIcon="solar:buildings-disabled-bold-duotone"
        />
      )}
    </div>
  );
}
