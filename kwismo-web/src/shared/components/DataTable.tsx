import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/shared/ui/table';
import { EmptyState } from './EmptyState';
import { LoadingSkeleton } from './LoadingSkeleton';
import { cn } from '@/shared/lib/utils';

export interface Column<T> {
  key:        string;
  header:     string;
  cell:       (row: T) => React.ReactNode;
  sortable?:  boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns:      Column<T>[];
  data:         T[];
  isLoading?:   boolean;
  emptyTitle?:  string;
  emptyDesc?:   string;
  getRowKey:    (row: T) => string;
  className?:   string;
}

type SortDir = 'asc' | 'desc' | null;

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyTitle  = 'Aucune donnée',
  emptyDesc,
  getRowKey,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const handleSort = (key: string) => {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); return; }
    if (sortDir === 'asc')  { setSortDir('desc'); return; }
    setSortKey(null); setSortDir(null);
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey) return <ChevronsUpDown size={14} className="opacity-40" />;
    return sortDir === 'asc'
      ? <ChevronUp  size={14} />
      : <ChevronDown size={14} />;
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className={cn('rounded-lg border border-[var(--color-border)] overflow-hidden', className)}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableHeader key={col.key} className={col.className}>
                {col.sortable ? (
                  <button
                    onClick={() => handleSort(col.key)}
                    className="flex items-center gap-1 hover:text-[var(--color-text)] transition-colors"
                  >
                    {col.header}
                    <SortIcon colKey={col.key} />
                  </button>
                ) : (
                  col.header
                )}
              </TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState title={emptyTitle} description={emptyDesc} />
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <TableRow key={getRowKey(row)}>
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
