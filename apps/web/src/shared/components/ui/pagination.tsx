// apps/web/src/shared/components/ui/pagination.tsx
/**
 * Pagination — Page navigation controls with configurable page size.
 *
 * Provides page buttons, page size selector, and item count display.
 *
 * @example
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   totalItems={100}
 *   onPageChange={(page) => handlePageChange(page)}
 * />
 */

'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  totalItems?: number;
  onPageSizeChange?: (size: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  totalItems,
  onPageSizeChange,
}: PaginationProps): JSX.Element {
  const startItem = totalItems ? (currentPage - 1) * pageSize + 1 : null;
  const endItem = totalItems
    ? Math.min(currentPage * pageSize, totalItems)
    : null;

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const getVisiblePages = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    // Show pages around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3">
      {/* Item count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {totalItems !== undefined && startItem !== null && endItem !== null ? (
          <span>
            Mostrando {startItem}-{endItem} de {totalItems}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {/* Page size selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Filas:
            </span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="
                h-8 rounded-md border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-900 px-2 text-sm text-gray-900 dark:text-gray-100
                focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500
              "
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          {/* First page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={!hasPrevious}
            className="
              flex items-center justify-center h-8 w-8 rounded-md
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-white/5
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            aria-label="Primera página"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          {/* Previous page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevious}
            className="
              flex items-center justify-center h-8 w-8 rounded-md
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-white/5
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          {getVisiblePages().map((page, index) =>
            page === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="flex items-center justify-center h-8 w-8 text-gray-500 dark:text-gray-400"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`
                  flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium
                  ${
                    page === currentPage
                      ? 'bg-brand-500 text-white dark:bg-brand-400 dark:text-gray-900'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
                aria-label={`Página ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            ),
          )}

          {/* Next page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext}
            className="
              flex items-center justify-center h-8 w-8 rounded-md
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-white/5
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Last page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNext}
            className="
              flex items-center justify-center h-8 w-8 rounded-md
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-white/5
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            aria-label="Última página"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
