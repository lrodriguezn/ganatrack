// apps/web/src/modules/servicios/hooks/use-servicios-veterinarios.ts
/**
 * useServiciosVeterinarios — paginated servicio veterinario events list.
 */

'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { serviciosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';
import type { PaginationParams, PaginatedServiciosVeterinarios } from '../types/servicios.types';

export function useServiciosVeterinarios(
  params: PaginationParams,
  options?: Pick<UseQueryOptions<PaginatedServiciosVeterinarios>, 'enabled'>
) {
  const { data, isLoading, error, refetch } = useQuery<PaginatedServiciosVeterinarios>({
    queryKey: queryKeys.servicios.veterinarios.list(params as unknown as Record<string, unknown>),
    queryFn: () => serviciosService.getServiciosVeterinarios(params),
    staleTime: StaleTimes.LIST,
    enabled: options?.enabled,
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
