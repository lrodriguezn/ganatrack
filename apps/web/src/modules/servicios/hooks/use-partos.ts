// apps/web/src/modules/servicios/hooks/use-partos.ts
/**
 * usePartos — paginated partos list.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { serviciosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';
import type { PaginationParams } from '../types/servicios.types';

export function usePartos(params: PaginationParams) {
  const { data, isLoading, error, refetch } = useQuery({
    // Cast needed: PaginationParams interface is not assignable to Record<string, unknown>
    // due to index signature mismatch. Safe here because queryKeys only reads the values.
    queryKey: queryKeys.servicios.partos.list(params as unknown as Record<string, unknown>),
    queryFn: () => serviciosService.getPartos(params),
    staleTime: StaleTimes.LIST,
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
