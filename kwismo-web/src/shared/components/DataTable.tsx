import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/shared/ui/table';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { cn } from '@/shared/lib/utils';

export interface Column<T> {
  key:        string;
  header:     string;
  cell:       (row: T) => React.ReactNode;
  sortable?:  boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns:        Column<T>[];
  data:           T[];
  isLoading?:     boolean;
  isError?:       boolean;
  errorMessage?:  string;
  onRetry?:       () => void;
  emptyTitle?:    string;
  emptyDesc?:     string;
  getRowKey:      (row: T) => string;
  pageSize?:      number;
  className?:     string;
}

type SortDir = 'asc' | 'desc' | null;

export function DataTable<T>({
  columns,
  data,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  emptyTitle,
  emptyDesc,
  getRowKey,
  pageSize = 10,
  className,
}: DataTableProps<T>) {
  const { t } = useTranslation('common');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  const handleSort = (key: string) => {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); return; }
    if (sortDir === 'asc')  { setSortDir('desc'); return; }
    setSortKey(null); setSortDir(null);
  };

  const paginatedData = useMemo(() => {
    const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
    const validPage = Math.min(currentPage, totalPages);
    const start = (validPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  if (isError) {
    return (
      <div className={cn('rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] p-8', className)}>
        <ErrorState message={errorMessage} onRetry={onRetry} />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4 font-body', className)}>
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] overflow-hidden shadow-sm">
        <Table>
          <TableHead>
            <TableRow className="bg-slate-50 dark:bg-[#0F1626]/60 border-b border-slate-200 dark:border-white/10">
              {columns.map((col) => (
                <TableHeader key={col.key} className={cn('py-3.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider', col.className)}>
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1.5 hover:text-brand-green transition-colors"
                    >
                      <span>{col.header}</span>
                      <Icon
                        icon={
                          sortKey !== col.key
                            ? 'solar:sort-vertical-bold-duotone'
                            : sortDir === 'asc'
                            ? 'solar:alt-arrow-up-bold'
                            : 'solar:alt-arrow-down-bold'
                        }
                        className="text-sm opacity-60"
                      />
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-white/5 animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="py-4 px-4">
                      <div className="h-4 bg-slate-200 dark:bg-white/10 rounded-md w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8">
                  <EmptyState title={emptyTitle || t('noData')} description={emptyDesc} />
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <TableRow key={getRowKey(row)} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                  {columns.map((col) => (
                    <TableCell key={col.key} className={cn('py-3.5 px-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200', col.className)}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>{t('pagination.show')}</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-8 px-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#161E33] text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>{t('pagination.rowsPerPage', { total: data.length })}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 px-3 rounded-lg border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-40 transition flex items-center gap-1 font-semibold"
            >
              <Icon icon="solar:alt-arrow-left-bold" className="text-sm" />
              <span>{t('pagination.previous')}</span>
            </button>

            <span className="font-semibold text-slate-700 dark:text-slate-200 px-2">
              {t('pagination.page')} {currentPage} {t('pagination.of')} {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-3 rounded-lg border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-40 transition flex items-center gap-1 font-semibold"
            >
              <span>{t('pagination.next')}</span>
              <Icon icon="solar:alt-arrow-right-bold" className="text-sm" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

