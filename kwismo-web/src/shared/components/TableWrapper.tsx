import React from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/shared/lib/utils';

export interface TableWrapperProps {
  title?: string;
  subtitle?: string;
  count?: number;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function TableWrapper({
  title,
  subtitle,
  count,
  headerActions,
  children,
  footer,
  className,
}: TableWrapperProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm font-body overflow-hidden',
        className
      )}
    >
      {}
      {(title || headerActions) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-brand-darkBg/40">
          <div>
            {title && (
              <div className="flex items-center gap-2.5">
                <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {title}
                </h3>
                {count !== undefined && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-brand-orange/15 text-brand-orange border border-brand-orange/20">
                    {count}
                  </span>
                )}
              </div>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>

          {headerActions && (
            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {}
      <div className="overflow-x-auto">{children}</div>

      {}
      {footer && (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-brand-darkBg/40">
          {footer}
        </div>
      )}
    </div>
  );
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  selectedCount?: number;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  selectedCount = 0,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-body">
      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
        <span>
          Affichage <strong className="text-slate-800 dark:text-slate-200 font-mono">{startItem}</strong> à{' '}
          <strong className="text-slate-800 dark:text-slate-200 font-mono">{endItem}</strong> sur{' '}
          <strong className="text-slate-800 dark:text-slate-200 font-mono">{totalItems}</strong> résultats
        </span>

        {selectedCount > 0 && (
          <span className="font-bold text-brand-orange bg-brand-orange/10 border border-brand-orange/20 px-2.5 py-0.5 rounded-full font-mono">
            {selectedCount} sélectionné(s)
          </span>
        )}

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span>Afficher</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 px-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              {[5, 10, 20, 50, 100].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        {/* First Page Button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="Première page"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <Icon icon="solar:double-alt-arrow-left-bold" className="text-sm" />
        </button>

        {/* Previous Page Button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          title="Page précédente"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <Icon icon="solar:alt-arrow-left-bold" className="text-sm" />
        </button>

        {getPageNumbers().map((page, idx) => (
          typeof page === 'number' ? (
            <button
              key={idx}
              onClick={() => onPageChange(page)}
              className={cn(
                'flex h-8 min-w-[32px] px-2 items-center justify-center rounded-lg text-xs font-bold transition font-mono',
                currentPage === page
                  ? 'bg-brand-navy dark:bg-brand-orange text-white dark:text-brand-navy shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
              )}
            >
              {page}
            </button>
          ) : (
            <span key={idx} className="px-1 text-slate-400">
              ...
            </span>
          )
        ))}

        {/* Next Page Button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          title="Page suivante"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <Icon icon="solar:alt-arrow-right-bold" className="text-sm" />
        </button>

        {/* Last Page Button */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          title="Dernière page"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <Icon icon="solar:double-alt-arrow-right-bold" className="text-sm" />
        </button>
      </div>
    </div>
  );
}
