// apps/web/src/shared/components/ui/data-table.tsx
/**
 * DataTable — TanStack Table v8 generic wrapper with server-side pagination.
 *
 * Provides server-side pagination, sorting, and filtering with loading
 * and empty states. The parent component controls data fetching.
 *
 * @example
 * <DataTable
 *   columns={columns}
 *   data={animals}
 *   pageCount={totalPages}
 *   onPaginationChange={({ pageIndex, pageSize }) => fetchData(pageIndex, pageSize)}
 *   isLoading={isLoading}
 * />
 */

'use client';

import * as React from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Skeleton } from './skeleton';
import { Pagination } from './pagination';

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  pageCount?: number;
  pageIndex?: number;
  pageSize?: number;
  totalRows?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onFilterChange?: (filters: ColumnFiltersState) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  emptyState?: React.ReactNode;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
}

export function DataTable<TData>({
  columns,
  data,
  pageCount = 1,
  pageIndex = 0,
  pageSize = 10,
  totalRows,
  onPaginationChange,
  onSortingChange,
  onFilterChange,
  isLoading = false,
  isFetching = false,
  emptyState,
  rowSelection,
  onRowSelectionChange,
}: DataTableProps<TData>): JSX.Element {
  const pagination: PaginationState = {
    pageIndex,
    pageSize,
  };

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination,
      rowSelection: rowSelection || {},
    },
    onRowSelectionChange: onRowSelectionChange
      ? (updater) => {
          const newSelection =
            typeof updater === 'function' ? updater(rowSelection || {}) : updater;
          onRowSelectionChange(newSelection);
        }
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  const handlePaginationChange = (newPagination: PaginationState) => {
    onPaginationChange?.(newPagination);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    onPaginationChange?.({ pageIndex: 0, pageSize: newPageSize });
  };

  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;
  const totalRowCount = table.getFilteredRowModel().rows.length;

  const renderEmptyState = () => {
    if (emptyState) return emptyState;
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <p>No hay datos para mostrar</p>
      </div>
    );
  };

  const renderLoadingSkeleton = () => {
    return (
      <>
        {Array.from({ length: 5 }).map((_, index) => (
          <tr key={`skeleton-${index}`} className="border-b border-gray-200 dark:border-gray-700">
            {columns.map((_, colIndex) => (
              <td key={`skeleton-${colIndex}`} className="px-4 py-3">
                <Skeleton className="h-8 w-full" />
              </td>
            ))}
          </tr>
        ))}
      </>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Bulk actions bar */}
      {selectedRowCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-brand-50 dark:bg-brand-500/10 px-4 py-2 text-sm text-brand-600 dark:text-brand-400">
          <span>{selectedRowCount} elemento{selectedRowCount !== 1 ? 's' : ''} seleccionado{selectedRowCount !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Table */}
      <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        {isFetching && !isLoading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-10" />
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 font-medium text-gray-700 dark:text-gray-200"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
              {isLoading ? (
                renderLoadingSkeleton()
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {renderEmptyState()}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 text-gray-900 dark:text-gray-100"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <Pagination
          currentPage={pageIndex + 1}
          totalPages={pageCount}
          totalItems={totalRows}
          pageSize={pageSize}
          onPageChange={(page) =>
            handlePaginationChange({ pageIndex: page - 1, pageSize })
          }
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
