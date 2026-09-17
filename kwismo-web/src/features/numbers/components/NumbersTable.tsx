import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { FilterBar } from '@/shared/components/FilterBar';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { KpiCard } from '@/shared/components/KpiCard';
import { TablePagination } from '@/shared/components/TableWrapper';
import { Button } from '@/shared/ui/button';
import { toast } from '@/shared/store/toastStore';
import { usePermissions } from '@/shared/hooks/usePermissions';
import type { NumberItem } from '../services/numbers.api';

interface NumbersTableProps {
  numbers: NumberItem[];
  isLoading?: boolean;
  onSelectNumber: (numero: NumberItem) => void;
  onDeleteNumber?: (numero: NumberItem) => void;
  onToggleStatus?: (numero: NumberItem) => void;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export default function NumbersTable({
  numbers,
  isLoading = false,
  onSelectNumber,
  onDeleteNumber,
  onToggleStatus,
  total,
  page = 1,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
}: NumbersTableProps) {
  const { t } = useTranslation(['admin', 'common']);
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('ALL');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const filteredNumbers = useMemo(() => {
    return numbers.filter((n) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        n.valeur.toLowerCase().includes(q) ||
        (n.country_id && n.country_id.toLowerCase().includes(q)) ||
        (n.operator_id && n.operator_id.toLowerCase().includes(q));

      const matchesOperator =
        operatorFilter === 'ALL' || (n.operator_id && n.operator_id.toUpperCase().includes(operatorFilter.toUpperCase()));

      const matchesCountry =
        countryFilter === 'ALL' || (n.country_id && n.country_id.toUpperCase().includes(countryFilter.toUpperCase()));

      const matchesStatus =
        statusFilter === 'ALL' || n.statut.toUpperCase() === statusFilter.toUpperCase();

      let matchesRisk = true;
      const scorePct = Math.round(n.score_risque <= 1 ? n.score_risque * 100 : n.score_risque);
      if (riskFilter === 'HIGH') matchesRisk = scorePct <= 40 || n.statut === 'frauduleux';
      if (riskFilter === 'MEDIUM') matchesRisk = (scorePct > 40 && scorePct < 80) || n.statut === 'a_signaler';
      if (riskFilter === 'LOW') matchesRisk = scorePct >= 80 || n.statut === 'securise';

      return matchesSearch && matchesOperator && matchesCountry && matchesStatus && matchesRisk;
    });
  }, [numbers, search, operatorFilter, countryFilter, riskFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalCount = total ?? numbers.length;
    const active = numbers.filter((n) => n.statut === 'securise' || n.statut === 'Sécurisé').length;
    const highRisk = numbers.filter((n) => {
      const score = n.score_risque <= 1 ? n.score_risque * 100 : n.score_risque;
      return score <= 40 || n.statut === 'frauduleux';
    }).length;
    const reported = numbers.filter((n) => (n.nombre_signalements && n.nombre_signalements > 0) || n.statut === 'a_signaler').length;
    return { total: totalCount, active, highRisk, reported };
  }, [numbers, total]);

  const totalPages = Math.ceil((total ?? filteredNumbers.length) / pageSize);

  const getCountryFlagCode = (countryCode?: string) => {
    if (!countryCode) return 'cm';
    const clean = countryCode.toLowerCase();
    if (clean.includes('cm')) return 'cm';
    if (clean.includes('ci')) return 'ci';
    if (clean.includes('sn')) return 'sn';
    if (clean.includes('bf')) return 'bf';
    if (clean.includes('gh')) return 'gh';
    if (clean.includes('ke')) return 'ke';
    if (clean.includes('ng')) return 'ng';
    return clean.slice(0, 2);
  };

  const columns: Column<NumberItem>[] = [
    {
      key: 'valeur',
      header: t('admin:numbers.phoneNumber'),
      sortable: true,
      cell: (numero) => (
        <div>
          <span className="font-mono font-bold text-sm tracking-wide text-slate-900 dark:text-white block">
            {numero.valeur}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {numero.date_derniere_verification
              ? new Date(numero.date_derniere_verification).toLocaleDateString()
              : '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'operator_id',
      header: t('admin:ussd.operators'),
      sortable: true,
      cell: (numero) => {
        const flagCode = getCountryFlagCode(numero.country_id);
        const opDisplay = numero.operator_name || (numero.operator_id && !numero.operator_id.startsWith('op_') ? numero.operator_id : 'Orange');
        return (
          <div className="flex items-center gap-2">
            <Icon icon={`circle-flags:${flagCode}`} className="text-xl shrink-0" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {opDisplay}
            </span>
          </div>
        );
      },

    },
    {
      key: 'score_risque',
      header: t('admin:numbers.riskScore'),
      sortable: true,
      cell: (numero) => {
        const scorePct = Math.round(numero.score_risque <= 1 ? numero.score_risque * 100 : numero.score_risque);
        const isLowScore = scorePct <= 40;
        const isMediumScore = scorePct > 40 && scorePct < 80;
        const color = isLowScore ? 'bg-rose-500' : isMediumScore ? 'bg-amber-500' : 'bg-brand-green';

        return (
          <div className="flex items-center gap-2.5 min-w-[120px]">
            <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${color}`}
                style={{ width: `${scorePct}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white w-10 text-right">
              {scorePct}%
            </span>
          </div>
        );
      },
    },
    {
      key: 'statut',
      header: t('common:status'),
      sortable: true,
      cell: (numero) => <StatusBadge status={numero.statut} size="sm" showDot={true} />,
    },
    {
      key: 'actions',
      header: t('common:actions.label'),
      align: 'right',
      cell: (numero) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onSelectNumber(numero)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-brand-navy hover:text-white dark:hover:bg-brand-orange dark:hover:text-brand-navy transition cursor-pointer"
          >
            <Icon icon="solar:eye-bold" className="text-sm" />
          </button>

          {hasPermission('numbers:update') && onToggleStatus && (
            <button
              onClick={() => onToggleStatus(numero)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition cursor-pointer"
            >
              <Icon icon="solar:shield-warning-bold" className="text-sm" />
            </button>
          )}

          {hasPermission('numbers:delete') && onDeleteNumber && (
            <button
              onClick={() => onDeleteNumber(numero)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition cursor-pointer"
            >
              <Icon icon="solar:trash-bin-trash-bold" className="text-sm" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const handleBulkDelete = () => {
    toast.success(t('numbers.toasts.bulkDeleteSuccess'));
    setSelectedKeys([]);
  };

  return (
    <div className="flex flex-col gap-6 w-full font-body">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title={t('admin:numbers.kpis.total')} value={stats.total} isLoading={isLoading} />
        <KpiCard title={t('admin:numbers.kpis.secured')} value={stats.active} badgeVariant="mint" isLoading={isLoading} />
        <KpiCard title={t('admin:numbers.kpis.fraudulent')} value={stats.highRisk} badgeVariant="danger" isLoading={isLoading} />
        <KpiCard title={t('admin:numbers.kpis.reported')} value={stats.reported} badgeVariant="warning" isLoading={isLoading} />
      </div>

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('admin:numbers.searchPlaceholder')}
        countryValue={countryFilter}
        onCountryChange={setCountryFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onResetFilters={() => {
          setSearch('');
          setOperatorFilter('ALL');
          setCountryFilter('ALL');
          setRiskFilter('ALL');
          setStatusFilter('ALL');
        }}
        onExport={hasPermission('numbers:export') ? () => toast.success(t('numbers.toasts.exportInitiated')) : undefined}
        selects={[
          {
            id: 'operator',
            value: operatorFilter,
            onChange: setOperatorFilter,
            icon: 'solar:buildings-2-linear',
            options: [
              { label: t('admin:numbers.filters.allOperators'), value: 'ALL' },
              { label: 'MTN', value: 'MTN' },
              { label: 'Orange', value: 'ORANGE' },
              { label: 'Wave', value: 'WAVE' },
              { label: 'Moov', value: 'MOOV' },
            ],
          },
          {
            id: 'risk',
            value: riskFilter,
            onChange: setRiskFilter,
            icon: 'solar:shield-warning-linear',
            options: [
              { label: t('admin:numbers.filters.allRisks'), value: 'ALL' },
              { label: t('admin:numbers.filters.highRisk'), value: 'HIGH' },
              { label: t('admin:numbers.filters.mediumRisk'), value: 'MEDIUM' },
              { label: t('admin:numbers.filters.lowRisk'), value: 'LOW' },
            ],
          },
        ]}
      />

      {selectedKeys.length > 0 && (
        <div className="p-4 rounded-2xl bg-brand-navy text-white flex items-center justify-between font-body animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-brand-orange text-brand-navy font-bold font-mono text-xs">
              {selectedKeys.length} {t('common:selected')}
            </span>
            <span className="text-xs sm:text-sm font-semibold">{t('admin:numbers.bulkActions')}</span>
          </div>
          <div className="flex items-center gap-2">
            {hasPermission('numbers:export') && (
              <Button size="xs" variant="outline" className="text-white border-white/20 hover:bg-white/10" onClick={() => toast.info(t('numbers.toasts.exportSelection'))}>
                {t('common:export')}
              </Button>
            )}
            {hasPermission('numbers:delete') && (
              <Button size="xs" variant="primary" className="bg-red-500 hover:bg-red-600 text-white" onClick={handleBulkDelete}>
                {t('common:delete')}
              </Button>
            )}
          </div>
        </div>
      )}

      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={filteredNumbers}
          isLoading={isLoading}
          getRowKey={(numero) => numero.id}
          pageSize={pageSize}
          selectable={true}
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          onRowClick={(numero) => onSelectNumber(numero)}
          emptyTitle={t('admin:numbers.emptyTitle')}
          emptyDesc={t('admin:numbers.emptyDesc')}
          emptyIcon="solar:phone-disabled-bold-duotone"
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNumbers.map((numero) => {
              const flagCode = getCountryFlagCode(numero.country_id);
              const scorePct = Math.round(numero.score_risque <= 1 ? numero.score_risque * 100 : numero.score_risque);

              return (
                <div
                  key={numero.id}
                  onClick={() => onSelectNumber(numero)}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between font-body"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <StatusBadge status={numero.statut} size="xs" />
                      <span className="text-xs font-mono text-slate-400">
                        {numero.date_derniere_verification
                          ? new Date(numero.date_derniere_verification).toLocaleDateString()
                          : '—'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <Icon icon={`circle-flags:${flagCode}`} className="text-3xl shrink-0" />
                      <div>
                        <h3 className="font-mono text-base font-bold text-slate-900 dark:text-white">
                          {numero.valeur}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {numero.operator_id || 'MTN'} ({numero.country_id || 'CM'})
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F1626] border border-slate-100 dark:border-white/5 space-y-2 mb-4 font-mono text-xs">
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-500">{t('admin:numbers.riskScore')}:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{scorePct}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 text-xs font-semibold">
                    <span className="text-slate-500">
                      {t('admin:numbers.reportsCount')}: {numero.nombre_signalements || 0}
                    </span>
                    <span className="text-brand-orange hover:underline flex items-center gap-1">
                      <span>{t('common:details')}</span>
                      <Icon icon="solar:alt-arrow-right-linear" className="text-xs" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-darkBg">
            <TablePagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total ?? filteredNumbers.length}
              pageSize={pageSize}
              onPageChange={onPageChange || (() => {})}
              onPageSizeChange={onPageSizeChange || (() => {})}
              selectedCount={selectedKeys.length}
            />
          </div>
        </div>
      )}
    </div>
  );
}
