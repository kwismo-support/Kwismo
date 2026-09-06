import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import type { PartnerDTO } from '@/shared/mock';

interface PartnersTableProps {
  partners: PartnerDTO[];
  isLoading?: boolean;
  onEditPartner: (partner: PartnerDTO) => void;
  onAddPartner?: () => void;
}

export default function PartnersTable({ partners, isLoading = false, onEditPartner, onAddPartner }: PartnersTableProps) {
  const { t } = useTranslation(['partner', 'common']);
  const [search, setSearch] = useState('');

  const filteredPartners = partners.filter(
    (p) =>
      p.nomEntreprise.toLowerCase().includes(search.toLowerCase()) ||
      p.typePartenariat.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: Column<PartnerDTO>[] = [
    {
      key: 'nomEntreprise',
      header: t('partner:partners.name'),
      sortable: true,
      cell: (partner) => (
        <div className="flex flex-col font-body">
          <span className="font-semibold text-slate-900 dark:text-white">
            {partner.nomEntreprise}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {partner.webhookUrl || t('common:noData')}
          </span>
        </div>
      ),
    },
    {
      key: 'typePartenariat',
      header: t('partner:partners.type'),
      sortable: true,
      cell: (partner) => (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-blue/10 text-brand-blue">
          {t(`partner:partners.type${partner.typePartenariat.charAt(0).toUpperCase() + partner.typePartenariat.slice(1)}`)}
        </span>
      ),
    },
    {
      key: 'prefixes',
      header: t('partner:partners.prefixes'),
      cell: (partner) => (
        <div className="flex items-center gap-1 flex-wrap">
          {partner.prefixes.length > 0 ? (
            partner.prefixes.slice(0, 4).map((pref) => (
              <span key={pref} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-xs font-mono">
                {pref}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'statut',
      header: t('common:status'),
      sortable: true,
      cell: (partner) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
          partner.statut === 'active'
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : partner.statut === 'pending'
            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
        }`}>
          {t(`partner:partners.status${partner.statut.charAt(0).toUpperCase() + partner.statut.slice(1)}`)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common:actions.label'),
      cell: (partner) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="xs"
            variant="ghost"
            leftIcon="solar:pen-bold"
            onClick={() => onEditPartner(partner)}
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

        {onAddPartner && (
          <Button
            size="sm"
            variant="secondary"
            leftIcon="solar:add-circle-bold"
            onClick={onAddPartner}
          >
            {t('partner:partners.create')}
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filteredPartners}
        isLoading={isLoading}
        getRowKey={(partner) => partner.id}
        pageSize={10}
      />
    </div>
  );
}
