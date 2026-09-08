import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { FilterBar } from '@/shared/components/FilterBar';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { UserAvatar } from '@/shared/ui/avatar';
import { KpiCard } from '@/shared/components/KpiCard';
import { TablePagination } from '@/shared/components/TableWrapper';
import { COUNTRY_LIST } from '@/shared/lib/phone';
import type { PartnerDTO } from '@/shared/mock';

interface PartnersTableProps {
  partners: PartnerDTO[];
  isLoading?: boolean;
  onEditPartner: (partner: PartnerDTO) => void;
  onAddPartner?: () => void;
  onDeletePartner?: (partner: PartnerDTO) => void;
}

export default function PartnersTable({
  partners,
  isLoading = false,
  onEditPartner,
  onDeletePartner,
}: PartnersTableProps) {
  const { t } = useTranslation(['partner', 'common']);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const matchesSearch =
        p.nomEntreprise.toLowerCase().includes(search.toLowerCase()) ||
        p.typePartenariat.toLowerCase().includes(search.toLowerCase()) ||
        p.pays.toLowerCase().includes(search.toLowerCase()) ||
        (p.email && p.email.toLowerCase().includes(search.toLowerCase())) ||
        (p.webhookUrl && p.webhookUrl.toLowerCase().includes(search.toLowerCase()));

      const matchesType =
        typeFilter === 'ALL' || p.typePartenariat.toUpperCase() === typeFilter.toUpperCase();

      const matchesCountry =
        countryFilter === 'ALL' ||
        p.pays.toLowerCase().includes(countryFilter.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || p.statut.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesType && matchesCountry && matchesStatus;
    });
  }, [partners, search, typeFilter, countryFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = partners.length;
    const active = partners.filter((p) => p.statut.toLowerCase() === 'actif' || p.statut.toLowerCase() === 'active').length;
    const telco = partners.filter((p) => p.typePartenariat.toLowerCase().includes('opérateur') || p.typePartenariat.toLowerCase() === 'telco').length;
    const bank = partners.filter((p) => p.typePartenariat.toLowerCase().includes('banque') || p.typePartenariat.toLowerCase() === 'bank').length;
    return { total, active, telco, bank };
  }, [partners]);

  const paginatedGridData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPartners.slice(start, start + pageSize);
  }, [filteredPartners, page, pageSize]);

  const totalPages = Math.ceil(filteredPartners.length / pageSize) || 1;

  const columns: Column<PartnerDTO>[] = [
    {
      key: 'nomEntreprise',
      header: t('partner:partners.name', 'Partenaire / Structure'),
      sortable: true,
      cell: (partner) => (
        <div className="flex items-center gap-3">
          <UserAvatar
            name={partner.nomEntreprise}
            roleRing="partner"
            size="md"
            statusDot={partner.statut === 'Actif' || partner.statut === 'active' ? 'active' : 'inactive'}
          />
          <div>
            <span className="font-title font-bold text-sm text-slate-900 dark:text-white block">
              {partner.nomEntreprise}
            </span>
            <span className="text-xs text-slate-400 font-mono truncate max-w-xs block">
              {partner.webhookUrl || 'Webhook non configuré'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'pays',
      header: 'Pays',
      sortable: true,
      cell: (partner) => {
        const countryObj = COUNTRY_LIST.find(
          (c) => c.nameFr.toLowerCase() === partner.pays.toLowerCase() || c.code.toLowerCase() === partner.pays.toLowerCase()
        );
        const flagIcon = countryObj?.icon || 'circle-flags:cm';
        return (
          <div className="flex items-center gap-2" title={`Pays : ${partner.pays}`}>
            <Icon icon={flagIcon} className="text-xl shrink-0" />
          </div>
        );
      },
    },
    {
      key: 'typePartenariat',
      header: t('partner:partners.type', 'Type'),
      sortable: true,
      cell: (partner) => (
        <StatusBadge
          status={partner.typePartenariat}
          size="xs"
          showDot={false}
          className="uppercase font-mono font-bold"
        />
      ),
    },
    {
      key: 'contact',
      header: 'Contact Référent',
      cell: (partner) => (
        <div className="flex flex-col text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {partner.contact || 'Non renseigné'}
          </span>
          {partner.email && (
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              {partner.email}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'numerosSurveilles',
      header: 'Numéraux Surveillés',
      sortable: true,
      align: 'center',
      cell: (partner) => (
        <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
          {(partner.numerosSurveilles || 0).toLocaleString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'statut',
      header: t('common:status', 'Statut'),
      sortable: true,
      cell: (partner) => <StatusBadge status={partner.statut} size="sm" showDot={true} />,
    },
    {
      key: 'actions',
      header: t('common:actions.label', 'Actions'),
      align: 'right',
      cell: (partner) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEditPartner(partner)}
            title="Modifier le partenaire"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-brand-navy hover:text-white dark:hover:bg-brand-orange dark:hover:text-brand-navy transition cursor-pointer"
          >
            <Icon icon="solar:pen-bold" className="text-sm" />
          </button>

          {onDeletePartner && (
            <button
              onClick={() => onDeletePartner(partner)}
              title="Supprimer le partenaire"
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
        <KpiCard
          title="Total Partenaires"
          value={stats.total}
          isLoading={isLoading}
        />
        <KpiCard
          title="Partenaires Actifs"
          value={stats.active}
          badgeText="Opérationnel"
          badgeVariant="mint"
          isLoading={isLoading}
        />
        <KpiCard
          title="Opérateurs Telco"
          value={stats.telco}
          isLoading={isLoading}
        />
        <KpiCard
          title="Banques & Fintechs"
          value={stats.bank}
          isLoading={isLoading}
        />
      </div>

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher une entreprise, un pays, un email..."
        countryValue={countryFilter}
        onCountryChange={setCountryFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onResetFilters={() => {
          setSearch('');
          setTypeFilter('ALL');
          setCountryFilter('ALL');
          setStatusFilter('ALL');
        }}
        onExport={() => alert('Export de la liste des partenaires...')}
        selects={[
          {
            id: 'type',
            value: typeFilter,
            onChange: setTypeFilter,
            icon: 'solar:widget-linear',
            options: [
              { label: 'Tous les types', value: 'ALL' },
              { label: 'Opérateurs Telco', value: 'OPÉRATEUR' },
              { label: 'Banques', value: 'BANQUE' },
              { label: 'Fintechs', value: 'FINTECH' },
              { label: 'Régulateurs', value: 'RÉGULATEUR' },
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
            ],
          },
        ]}
      />

      {viewMode === 'grid' ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedGridData.map((partner) => {
              const countryObj = COUNTRY_LIST.find(
                (c) => c.nameFr.toLowerCase() === partner.pays.toLowerCase() || c.code.toLowerCase() === partner.pays.toLowerCase()
              );
              const flagIcon = countryObj?.icon || 'circle-flags:cm';
              return (
                <div
                  key={partner.id}
                  onClick={() => onEditPartner(partner)}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm flex flex-col justify-between hover:shadow-md transition cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <StatusBadge status={partner.statut} size="xs" showDot />
                      <span className="text-xs font-mono text-slate-400 font-semibold">{partner.typePartenariat}</span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <UserAvatar name={partner.nomEntreprise} roleRing="partner" size="md" />
                      <div className="min-w-0">
                        <h4 className="font-title text-sm font-bold text-slate-900 dark:text-white truncate">
                          {partner.nomEntreprise}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5" title={`Pays : ${partner.pays}`}>
                          <Icon icon={flagIcon} className="text-base shrink-0" />
                          <span className="text-xs text-slate-500 font-semibold truncate">{partner.pays}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 space-y-1 text-xs">
                      <p className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Contact :</span>
                        <span className="font-bold text-slate-900 dark:text-white truncate">{partner.contact || '—'}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Surveillés :</span>
                        <span className="font-mono font-bold text-brand-green">{(partner.numerosSurveilles || 0).toLocaleString('fr-FR')}</span>
                      </p>
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
                      Éditer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={filteredPartners.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredPartners}
          isLoading={isLoading}
          getRowKey={(partner) => partner.id}
          pageSize={10}
          selectable={true}
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          onRowClick={(partner) => onEditPartner(partner)}
          emptyTitle="Aucun partenaire trouvé"
          emptyDesc="Créez un nouveau partenariat institutionnel ou modifiez les critères de recherche."
          emptyIcon="solar:buildings-disabled-bold-duotone"
        />
      )}
    </div>
  );
}

