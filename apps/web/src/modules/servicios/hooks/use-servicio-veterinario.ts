// apps/web/src/modules/servicios/hooks/use-servicio-veterinario.ts
/**
 * useServicioVeterinario — single servicio veterinario event detail.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { serviciosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';

export function useServicioVeterinario(id: number) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.servicios.veterinarios.detail(id),
    queryFn: () => serviciosService.getServicioVeterinarioById(id),
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
