import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import NumberStatusBadge from './NumberStatusBadge';
import type { NumeroDTO } from '@/shared/mock';

interface NumbersTableProps {
  numbers: NumeroDTO[];
  isLoading?: boolean;
  onSelectNumber: (numero: NumeroDTO) => void;
}

export default function NumbersTable({ numbers, isLoading = false, onSelectNumber }: NumbersTableProps) {
  const { t } = useTranslation(['admin', 'common']);
  const [search, setSearch] = useState('');

  const filteredNumbers = numbers.filter(
    (n) =>
      n.valeur.includes(search) ||
      n.operatorName.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: Column<NumeroDTO>[] = [
    {
      key: 'valeur',
      header: t('admin:numbers.phoneNumber'),
      sortable: true,
      cell: (numero) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white">
          {numero.valeur}
        </span>
      ),
    },
    {
      key: 'operatorName',
      header: t('admin:ussd.operators'),
      sortable: true,
      cell: (numero) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {numero.operatorName} ({numero.countryCode})
        </span>
      ),
    },
    {
      key: 'scoreRisque',
      header: t('admin:numbers.riskScore'),
      sortable: true,
      cell: (numero) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                numero.scoreRisque >= 80 ? 'bg-rose-500' : numero.scoreRisque >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${numero.scoreRisque}%` }}
            />
          </div>
          <span className="font-mono text-xs font-semibold">{numero.scoreRisque} / 100</span>
        </div>
      ),
    },
    {
      key: 'reportsCount',
      header: t('admin:numbers.reportCount'),
      sortable: true,
      cell: (numero) => (
        <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">
          {numero.reportsCount}
        </span>
      ),
    },
    {
      key: 'statut',
      header: t('common:status'),
      sortable: true,
      cell: (numero) => <NumberStatusBadge status={numero.statut} />,
    },
    {
      key: 'actions',
      header: t('common:actions.label'),
      cell: (numero) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="xs"
            variant="ghost"
            leftIcon="solar:eye-bold"
            onClick={() => onSelectNumber(numero)}
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
      </div>

      <DataTable
        columns={columns}
        data={filteredNumbers}
        isLoading={isLoading}
        getRowKey={(numero) => numero.id}
        pageSize={10}
      />
    </div>
  );
}
