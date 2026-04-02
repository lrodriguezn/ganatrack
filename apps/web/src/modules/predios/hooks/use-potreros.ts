// apps/web/src/modules/predios/hooks/use-potreros.ts
/**
 * usePotreros — query hook for potreros of a specific Predio.
 *
 * Fetches all potreros belonging to a Predio.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';
import type { Potrero } from '@ganatrack/shared-types';

export interface UsePotrerosOptions {
  predioId: number;
}

export interface UsePotrerosReturn {
  potreros: Potrero[];
  isLoading: boolean;
  error: Error | null;
}

export function usePotreros(options: UsePotrerosOptions): UsePotrerosReturn {
  const { predioId } = options;

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.predios.potreros(predioId),
    queryFn: () => prediosService.getPotreros(predioId),
    staleTime: StaleTimes.LIST,
    enabled: predioId > 0,
  });

  return {
    potreros: data ?? [],
    isLoading,
    error: error as Error | null,
  };
}
