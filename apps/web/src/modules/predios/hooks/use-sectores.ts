// apps/web/src/modules/predios/hooks/use-sectores.ts
/**
 * useSectores — query hook for sectores of a specific Predio.
 *
 * Fetches all sectores belonging to a Predio.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';
import type { Sector } from '@ganatrack/shared-types';

export interface UseSectoresOptions {
  predioId: number;
}

export interface UseSectoresReturn {
  sectores: Sector[];
  isLoading: boolean;
  error: Error | null;
}

export function useSectores(options: UseSectoresOptions): UseSectoresReturn {
  const { predioId } = options;

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.predios.sectores(predioId),
    queryFn: () => prediosService.getSectores(predioId),
    staleTime: StaleTimes.LIST,
    enabled: predioId > 0,
  });

  return {
    sectores: data ?? [],
    isLoading,
    error: error as Error | null,
  };
}
