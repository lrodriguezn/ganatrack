// apps/web/src/modules/servicios/hooks/use-inseminacion.ts
/**
 * useInseminacion — single inseminación event detail.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { serviciosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';

export function useInseminacion(id: number) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.servicios.inseminaciones.detail(id),
    queryFn: () => serviciosService.getInseminacionById(id),
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
