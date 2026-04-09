// apps/web/src/modules/predios/hooks/use-lote.ts
/**
 * useLote — query hook for single Lote detail.
 *
 * Fetches a single Lote by ID within a Predio context.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { prediosService } from '../services';
import { StaleTimes } from '@/shared/lib/query-client';
import type { Lote } from '@ganatrack/shared-types';

export interface UseLoteOptions {
  predioId: number;
  id: number;
}

export interface UseLoteReturn {
  lote: Lote | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useLote(options: UseLoteOptions): UseLoteReturn {
  const { predioId, id } = options;

  const { data, isLoading, error } = useQuery({
    queryKey: ['predios', predioId, 'lotes', id],
    queryFn: () => prediosService.getLote(predioId, id),
    staleTime: StaleTimes.DETAIL,
    enabled: predioId > 0 && id > 0,
  });

  return {
    lote: data,
    isLoading,
    error: error as Error | null,
  };
}
