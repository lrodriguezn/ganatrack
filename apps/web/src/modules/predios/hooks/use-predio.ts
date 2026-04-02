// apps/web/src/modules/predios/hooks/use-predio.ts
/**
 * usePredio — query hook for single Predio detail.
 *
 * Fetches a single Predio by ID.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';
import type { Predio } from '@ganatrack/shared-types';

export interface UsePredioOptions {
  id: number;
}

export interface UsePredioReturn {
  predio: Predio | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function usePredio(options: UsePredioOptions): UsePredioReturn {
  const { id } = options;

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.predios.detail(id),
    queryFn: () => prediosService.getPredio(id),
    staleTime: StaleTimes.DETAIL,
    enabled: id > 0,
  });

  return {
    predio: data,
    isLoading,
    error: error as Error | null,
  };
}
