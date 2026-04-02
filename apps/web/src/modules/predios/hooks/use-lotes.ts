// apps/web/src/modules/predios/hooks/use-lotes.ts
/**
 * useLotes — query hook for lotes of a specific Predio.
 *
 * Fetches all lotes belonging to a Predio.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';
import type { Lote } from '@ganatrack/shared-types';

export interface UseLotesOptions {
  predioId: number;
}

export interface UseLotesReturn {
  lotes: Lote[];
  isLoading: boolean;
  error: Error | null;
}

export function useLotes(options: UseLotesOptions): UseLotesReturn {
  const { predioId } = options;

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.predios.lotes(predioId),
    queryFn: () => prediosService.getLotes(predioId),
    staleTime: StaleTimes.LIST,
    enabled: predioId > 0,
  });

  return {
    lotes: data ?? [],
    isLoading,
    error: error as Error | null,
  };
}
