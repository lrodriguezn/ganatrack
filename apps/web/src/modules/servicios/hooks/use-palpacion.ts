// apps/web/src/modules/servicios/hooks/use-palpacion.ts
/**
 * usePalpacion — single palpación event detail.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { serviciosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';

export function usePalpacion(id: number) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.servicios.palpaciones.detail(id),
    queryFn: () => serviciosService.getPalpacionById(id),
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
