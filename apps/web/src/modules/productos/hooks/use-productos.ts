// apps/web/src/modules/productos/hooks/use-productos.ts
/**
 * useProductos — paginated product list with server-side filters.
 *
 * @example
 * const { data, isLoading, error, refetch } = useProductos({
 *   predioId: 1,
 *   page: 1,
 *   limit: 10,
 *   tipoKey: 1,
 * });
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { productoService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';
import type { ProductoFilters } from '../types/producto.types';

export function useProductos(filters: ProductoFilters) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.productos.list(filters),
    queryFn: () => productoService.getAll(filters),
    staleTime: StaleTimes.LIST,
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
