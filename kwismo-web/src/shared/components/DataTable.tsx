import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/shared/ui/table';
import { TableWrapper, TablePagination } from './TableWrapper';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { toast } from '@/shared/store/toastStore';
import { cn } from '@/shared/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  title?: string;
  subtitle?: string;
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDesc?: string;
  emptyIcon?: string;
  getRowKey: (row: T) => string;
  pageSize?: number;
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (selectedKeys: string[]) => void;
  onRowClick?: (row: T) => void;
  toolbar?: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
}

type SortDir = 'asc' | 'desc' | null;

export function DataTable<T>({
  title,
  subtitle,
  columns,
  data,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  emptyTitle,
  emptyDesc,
  emptyIcon,
  getRowKey,
  pageSize = 10,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  onRowClick,
  toolbar,
  headerActions,
  className,
}: DataTableProps<T>) {
  const { t } = useTranslation('common');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
      return;
    }
    if (sortDir === 'asc') {
      setSortDir('desc');
      return;
    }
    setSortKey(null);
    setSortDir(null);
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a: any, b: any) => {
      const valA = a[sortKey] ?? '';
      const valB = b[sortKey] ?? '';
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortDir === 'asc' ? -1 : 1;
      if (strA > strB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir]);

  const paginatedData = useMemo(() => {
    const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
    const validPage = Math.min(currentPage, totalPages);
    const start = (validPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));

  const allPaginatedKeys = useMemo(() => {
    return paginatedData.map(getRowKey);
  }, [paginatedData, getRowKey]);

  const isAllPaginatedSelected =
    allPaginatedKeys.length > 0 &&
    allPaginatedKeys.every((k) => selectedKeys.includes(k));

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (isAllPaginatedSelected) {
      onSelectionChange(selectedKeys.filter((k) => !allPaginatedKeys.includes(k)));
    } else {
      const combined = Array.from(new Set([...selectedKeys, ...allPaginatedKeys]));
      onSelectionChange(combined);
    }
  };

  const handleSelectRow = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSelectionChange) return;
    if (selectedKeys.includes(key)) {
      onSelectionChange(selectedKeys.filter((k) => k !== key));
    } else {
      onSelectionChange([...selectedKeys, key]);
    }
  };

  if (isError) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy p-8',
          className
        )}
      >
        <ErrorState message={errorMessage} onRetry={onRetry} />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4 font-body', className)}>
      {toolbar && <div>{toolbar}</div>}

      {/* Bulk Action Bar */}
      {selectedKeys.length > 0 && (
        <div className="flex items-center justify-between p-3.5 px-5 rounded-2xl bg-brand-navy text-white shadow-md animate-in fade-in slide-in-from-top-2 border border-brand-orange/30">
          <div className="flex items-center gap-2.5 text-xs font-bold font-title">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-orange text-brand-navy text-xs font-bold">
              {selectedKeys.length}
            </span>
            <span>élément(s) sélectionné(s)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toast.success(`${selectedKeys.length} élément(s) supprimé(s).`);
                onSelectionChange?.([]);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition cursor-pointer"
            >
              <Icon icon="solar:trash-bin-trash-bold" className="text-sm" />
              <span>Supprimer la sélection</span>
            </button>
            <button
              onClick={() => onSelectionChange?.([])}
              className="px-3 py-1.5 rounded-xl border border-white/20 hover:bg-white/10 text-white text-xs font-semibold transition cursor-pointer"
            >
              Désélectionner
            </button>
          </div>
        </div>
      )}

      <TableWrapper
        title={title}
        subtitle={subtitle}
        count={data.length}
        headerActions={headerActions}
        footer={
          !isLoading && data.length > 0 ? (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={data.length}
              pageSize={itemsPerPage}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setItemsPerPage(newSize);
                setCurrentPage(1);
              }}
              selectedCount={selectedKeys.length}
            />
          ) : null
        }
      >
        <Table>
          <TableHead>
            <TableRow className="bg-slate-50/80 dark:bg-brand-darkBg border-b border-slate-200 dark:border-white/10">
              {selectable && (
                <TableHeader className="w-12 px-4 py-3.5 text-center"> 
                  <input
                    type="checkbox"
                    checked={isAllPaginatedSelected}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 dark:border-white/20 text-brand-orange focus:ring-brand-orange h-4 w-4 cursor-pointer"
                  />
                </TableHeader>
              )}

              {columns.map((col) => (
                <TableHeader
                  key={col.key}
                  className={cn(
                    'py-3.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.className
                  )}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className={cn(
                        'inline-flex items-center gap-1.5 hover:text-brand-orange transition-colors font-bold',
                        col.align === 'center' && 'justify-center',
                        col.align === 'right' && 'justify-end'
                      )}
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
                        className="text-sm opacity-60 text-brand-orange"
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
              Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-100 dark:border-white/5 animate-pulse"
                >
                  {selectable && (
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 w-4 rounded bg-slate-200 dark:bg-white/10 mx-auto" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="py-4 px-4">
                      <div className="h-4 bg-slate-200 dark:bg-white/10 rounded-md w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-12">
                  <EmptyState
                    title={emptyTitle || t('noData')}
                    description={emptyDesc}
                    icon={emptyIcon}
                  />
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const key = getRowKey(row);
                const isSelected = selectedKeys.includes(key);

                return (
                  <TableRow
                    key={key}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      'border-b border-slate-100 dark:border-white/5 transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-white/[0.03]',
                      isSelected && 'bg-brand-orange/5 dark:bg-brand-orange/10'
                    )}
                  >
                    {selectable && (
                      <TableCell
                        className="w-12 px-4 py-3.5 text-center"
                        onClick={(e) => handleSelectRow(key, e)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-slate-300 dark:border-white/20 text-brand-orange focus:ring-brand-orange h-4 w-4 cursor-pointer"
                        />
                      </TableCell>
                    )}

                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={cn(
                          'py-3.5 px-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200',
                          col.align === 'center' && 'text-center',
                          col.align === 'right' && 'text-right',
                          col.className
                        )}
                      >
                        {col.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableWrapper>
    </div>
  );
}
