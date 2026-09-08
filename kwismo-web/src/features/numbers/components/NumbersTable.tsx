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
import type { NumeroDTO } from '@/shared/mock';

interface NumbersTableProps {
  numbers: NumeroDTO[];
  isLoading?: boolean;
  onSelectNumber: (numero: NumeroDTO) => void;
  onDeleteNumber?: (numero: NumeroDTO) => void;
  onToggleStatus?: (numero: NumeroDTO) => void;
}

export default function NumbersTable({
  numbers,
  isLoading = false,
  onSelectNumber,
  onDeleteNumber,
  onToggleStatus,
}: NumbersTableProps) {
  const { t } = useTranslation(['admin', 'common']);
  const [search, setSearch] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('ALL');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Pagination state for Grid View & Table View
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredNumbers = useMemo(() => {
    return numbers.filter((n) => {
      const matchesSearch =
        n.valeur.includes(search) ||
        n.operatorName.toLowerCase().includes(search.toLowerCase()) ||
        n.countryCode.toLowerCase().includes(search.toLowerCase()) ||
        (n.partenaire && n.partenaire.toLowerCase().includes(search.toLowerCase())) ||
        (n.compte && n.compte.toLowerCase().includes(search.toLowerCase()));

      const matchesOperator =
        operatorFilter === 'ALL' || n.operatorName.toUpperCase().includes(operatorFilter.toUpperCase());

      const matchesCountry =
        countryFilter === 'ALL' || n.countryCode.toUpperCase().includes(countryFilter.toUpperCase());

      const matchesStatus =
        statusFilter === 'ALL' || n.statut.toUpperCase() === statusFilter.toUpperCase();

      let matchesRisk = true;
      if (riskFilter === 'HIGH') matchesRisk = n.scoreRisque <= 40 || n.statut === 'Frauduleux';
      if (riskFilter === 'MEDIUM') matchesRisk = (n.scoreRisque > 40 && n.scoreRisque < 80) || n.statut === 'À signaler';
      if (riskFilter === 'LOW') matchesRisk = n.scoreRisque >= 80 || n.statut === 'Sécurisé';

      return matchesSearch && matchesOperator && matchesCountry && matchesStatus && matchesRisk;
    });
  }, [numbers, search, operatorFilter, countryFilter, riskFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = numbers.length;
    const active = numbers.filter((n) => n.statut === 'Sécurisé' || n.statut === 'securise').length;
    const highRisk = numbers.filter((n) => n.scoreRisque <= 40 || n.statut === 'Frauduleux').length;
    const reported = numbers.filter((n) => n.reportsCount > 0 || n.statut === 'À signaler').length;
    return { total, active, highRisk, reported };
  }, [numbers]);

  // Paginated data for Grid View
  const paginatedGridData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredNumbers.slice(start, start + pageSize);
  }, [filteredNumbers, page, pageSize]);

  const totalPages = Math.ceil(filteredNumbers.length / pageSize);

  const getCountryFlagCode = (countryCode: string) => {
    if (countryCode.includes('CM')) return 'cm';
    if (countryCode.includes('CI')) return 'ci';
    if (countryCode.includes('SN')) return 'sn';
    if (countryCode.includes('BF')) return 'bf';
    if (countryCode.includes('GH')) return 'gh';
    if (countryCode.includes('KE')) return 'ke';
    if (countryCode.includes('NG')) return 'ng';
    return 'cm';
  };

  const columns: Column<NumeroDTO>[] = [
    {
      key: 'valeur',
      header: t('admin:numbers.phoneNumber', 'Numéro Virtuel'),
      sortable: true,
      cell: (numero) => (
        <div>
          <span className="font-mono font-bold text-sm tracking-wide text-slate-900 dark:text-white block">
            {numero.valeur}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Dernière analyse : {numero.dateDerniereVerification}
          </span>
        </div>
      ),
    },
    {
      key: 'operatorName',
      header: t('admin:ussd.operators', 'Opérateur / Pays'),
      sortable: true,
      cell: (numero) => {
        const flagCode = getCountryFlagCode(numero.countryCode);
        return (
          <div className="flex items-center gap-2" title={`Pays : ${numero.countryCode}`}>
            <Icon icon={`circle-flags:${flagCode}`} className="text-xl shrink-0" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {numero.operatorName}
            </span>
          </div>
        );
      },
    },
    {
      key: 'partenaire',
      header: 'Partenaire Affilié',
      sortable: true,
      cell: (numero) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-body">
          {numero.partenaire || '—'}
        </span>
      ),
    },
    {
      key: 'compte',
      header: 'Compte Propriétaire',
      sortable: true,
      cell: (numero) => (
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          {numero.compte || 'Non rattaché'}
        </span>
      ),
    },
    {
      key: 'scoreRisque',
      header: t('admin:numbers.riskScore', 'Score IA'),
      sortable: true,
      cell: (numero) => {
        const isLowScore = numero.scoreRisque <= 40;
        const isMediumScore = numero.scoreRisque > 40 && numero.scoreRisque < 80;
        const color = isLowScore ? 'bg-rose-500' : isMediumScore ? 'bg-amber-500' : 'bg-brand-green';

        return (
          <div className="flex items-center gap-2.5 min-w-[120px]">
            <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${color}`}
                style={{ width: `${numero.scoreRisque}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white w-10 text-right">
              {numero.scoreRisque}%
            </span>
          </div>
        );
      },
    },
    {
      key: 'statut',
      header: t('common:status', 'Statut'),
      sortable: true,
      cell: (numero) => <StatusBadge status={numero.statut} size="sm" showDot={true} />,
    },
    {
      key: 'actions',
      header: t('common:actions.label', 'Actions'),
      align: 'right',
      cell: (numero) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onSelectNumber(numero)}
            title="Inspecter le numéro"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-brand-navy hover:text-white dark:hover:bg-brand-orange dark:hover:text-brand-navy transition cursor-pointer"
          >
            <Icon icon="solar:eye-bold" className="text-sm" />
          </button>

          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(numero)}
              title="Changer le statut"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition cursor-pointer"
            >
              <Icon icon="solar:shield-warning-bold" className="text-sm" />
            </button>
          )}

          {onDeleteNumber && (
            <button
              onClick={() => onDeleteNumber(numero)}
              title="Supprimer le numéro"
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
    toast.success(`${selectedKeys.length} numéro(s) sélectionné(s) supprimé(s).`);
    setSelectedKeys([]);
  };

  return (
    <div className="flex flex-col gap-6 w-full font-body">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Numéraux" value={stats.total} isLoading={isLoading} />
        <KpiCard title="Numéraux Sécurisés" value={stats.active} badgeText="Sécurisé" badgeVariant="mint" isLoading={isLoading} />
        <KpiCard title="Numéraux Frauduleux" value={stats.highRisk} badgeText="Alerte" badgeVariant="danger" isLoading={isLoading} />
        <KpiCard title="Numéraux à Signaler" value={stats.reported} badgeText="Revue" badgeVariant="warning" isLoading={isLoading} />
      </div>

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par numéro, partenaire, email..."
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
        onExport={() => toast.success('Export CSV des numéraux initié')}
        selects={[
          {
            id: 'operator',
            value: operatorFilter,
            onChange: setOperatorFilter,
            icon: 'solar:buildings-2-linear',
            options: [
              { label: 'Tous les opérateurs', value: 'ALL' },
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
              { label: 'Tous les risques', value: 'ALL' },
              { label: 'Frauduleux (≤40)', value: 'HIGH' },
              { label: 'À signaler (41-79)', value: 'MEDIUM' },
              { label: 'Sécurisé (≥80)', value: 'LOW' },
            ],
          },
        ]}
      />

      {/* Bulk Action Bar */}
      {selectedKeys.length > 0 && (
        <div className="p-4 rounded-2xl bg-brand-navy text-white flex items-center justify-between font-body animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-brand-orange text-brand-navy font-bold font-mono text-xs">
              {selectedKeys.length} sélectionné(s)
            </span>
            <span className="text-xs sm:text-sm font-semibold">Actions groupées sur les numéros</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="xs" variant="outline" className="text-white border-white/20 hover:bg-white/10" onClick={() => toast.info('Export des éléments sélectionnés')}>
              Exporter la sélection
            </Button>
            <Button size="xs" variant="primary" className="bg-red-500 hover:bg-red-600 text-white" onClick={handleBulkDelete}>
              Supprimer la sélection
            </Button>
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
          emptyTitle="Aucun numéro trouvé"
          emptyDesc="Modifiez vos critères de recherche ou ajoutez de nouveaux numéraux."
          emptyIcon="solar:phone-disabled-bold-duotone"
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedGridData.map((numero) => {
              const flagCode = getCountryFlagCode(numero.countryCode);
              return (
                <div
                  key={numero.id}
                  onClick={() => onSelectNumber(numero)}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between font-body"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <StatusBadge status={numero.statut} size="xs" />
                      <span className="text-xs font-mono text-slate-400">{numero.dateDerniereVerification}</span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <Icon icon={`circle-flags:${flagCode}`} className="text-3xl shrink-0" />
                      <div>
                        <h3 className="font-mono text-base font-bold text-slate-900 dark:text-white">
                          {numero.valeur}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {numero.operatorName} ({numero.countryCode})
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F1626] border border-slate-100 dark:border-white/5 space-y-2 mb-4 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Partenaire:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{numero.partenaire || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Compte:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{numero.compte || 'Libre'}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-white/10">
                        <span className="text-slate-500">Score IA:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{numero.scoreRisque}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 text-xs font-semibold">
                    <span className="text-slate-500">Signalements: {numero.reportsCount}</span>
                    <span className="text-brand-orange hover:underline flex items-center gap-1">
                      <span>Détails</span>
                      <Icon icon="solar:alt-arrow-right-linear" className="text-xs" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid View Pagination */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33]">
            <TablePagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={filteredNumbers.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              selectedCount={selectedKeys.length}
            />
          </div>
        </div>
      )}
    </div>
  );
}
