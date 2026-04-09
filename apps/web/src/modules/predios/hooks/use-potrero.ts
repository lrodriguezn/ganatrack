// apps/web/src/modules/predios/hooks/use-potrero.ts
/**
 * usePotrero — query hook for single Potrero detail.
 *
 * Fetches a single Potrero by ID within a Predio context.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { prediosService } from '../services';
import { StaleTimes } from '@/shared/lib/query-client';
import type { Potrero } from '@ganatrack/shared-types';

export interface UsePotreroOptions {
  predioId: number;
  id: number;
}

export interface UsePotreroReturn {
  potrero: Potrero | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function usePotrero(options: UsePotreroOptions): UsePotreroReturn {
  const { predioId, id } = options;

  const { data, isLoading, error } = useQuery({
    queryKey: ['predios', predioId, 'potreros', id],
    queryFn: () => prediosService.getPotrero(predioId, id),
    staleTime: StaleTimes.DETAIL,
    enabled: predioId > 0 && id > 0,
  });

  return {
    potrero: data,
    isLoading,
    error: error as Error | null,
  };
}
