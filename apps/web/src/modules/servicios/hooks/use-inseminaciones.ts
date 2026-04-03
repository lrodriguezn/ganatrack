// apps/web/src/modules/servicios/hooks/use-inseminaciones.ts
/**
 * useInseminaciones — paginated inseminación events list.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { serviciosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';
import type { PaginationParams } from '../types/servicios.types';

export function useInseminaciones(params: PaginationParams) {
  const { data, isLoading, error, refetch } = useQuery({
    // Cast needed: PaginationParams interface is not assignable to Record<string, unknown>
    // due to index signature mismatch. Safe here because queryKeys only reads the values.
    queryKey: queryKeys.servicios.inseminaciones.list(params as unknown as Record<string, unknown>),
    queryFn: () => serviciosService.getInseminaciones(params),
    staleTime: StaleTimes.LIST,
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
