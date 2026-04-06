// apps/web/src/shared/hooks/use-pagination.ts
/**
 * usePagination — Manages pagination state for list/table views.
 *
 * Consolidates the repeated pattern of pageIndex + pageSize useState calls.
 * Returns 1-based page for API calls, 0-based index for TanStack Table compat.
 *
 * @param options - Configuration options
 * @returns Pagination state and handlers
 *
 * @example
 * const { page, pageIndex, pageSize, totalPages, setPage, setPageSize } = usePagination({
 *   defaultPageSize: 10,
 *   totalItems: data?.total,
 * });
 *
 * // API call uses `page` (1-based)
 * const { data } = useAnimales({ page, limit: pageSize });
 *
 * // Table uses `pageIndex` (0-based)
 * <DataTable page={pageIndex} onPaginationChange={...} />
 */
'use client';

import { useState, useCallback, useMemo } from 'react';

interface UsePaginationOptions {
  defaultPage?: number;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  totalItems?: number;
}

interface UsePaginationReturn {
  /** Current page number (1-based, for API calls) */
  page: number;
  /** Current page index (0-based, for TanStack Table) */
  pageIndex: number;
  /** Items per page */
  pageSize: number;
  /** Total number of pages (derived from totalItems) */
  totalPages: number;
  /** Navigate to a specific page (1-based) */
  setPage: (page: number) => void;
  /** Set page size (resets to page 1) */
  setPageSize: (size: number) => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  prevPage: () => void;
  /** Whether there's a next page */
  hasNext: boolean;
  /** Whether there's a previous page */
  hasPrev: boolean;
  /** Start item index (1-based, for display) */
  startItem: number;
  /** End item index (1-based, for display) */
  endItem: number;
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    defaultPage = 1,
    defaultPageSize = 10,
    totalItems,
  } = options;

  const [page, setPageState] = useState(defaultPage);
  const [pageSize, setPageSizeState] = useState(defaultPageSize);

  const totalPages = useMemo(() => {
    if (!totalItems || totalItems <= 0) return 1;
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  const setPage = useCallback((newPage: number) => {
    const clamped = Math.max(1, Math.min(newPage, totalPages));
    setPageState(clamped);
  }, [totalPages]);

  const setPageSize = useCallback((newSize: number) => {
    setPageSizeState(newSize);
    setPageState(1); // Reset to first page on size change
  }, []);

  const nextPage = useCallback(() => {
    setPage(page + 1);
  }, [page, setPage]);

  const prevPage = useCallback(() => {
    setPage(page - 1);
  }, [page, setPage]);

  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const startItem = totalItems ? (page - 1) * pageSize + 1 : 0;
  const endItem = totalItems ? Math.min(page * pageSize, totalItems) : 0;

  return {
    page,
    pageIndex: page - 1,
    pageSize,
    totalPages,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    hasNext,
    hasPrev,
    startItem,
    endItem,
  };
}
