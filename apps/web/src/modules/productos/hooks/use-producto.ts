// apps/web/src/modules/productos/hooks/use-producto.ts
/**
 * useProducto — single product detail query.
 *
 * @example
 * const { data, isLoading, error } = useProducto(123);
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { productoService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';

export function useProducto(id: number) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.productos.detail(id),
    queryFn: () => productoService.getById(id),
    staleTime: StaleTimes.DETAIL,
    enabled: id > 0,
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
