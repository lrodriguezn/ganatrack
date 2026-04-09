// apps/web/src/modules/predios/hooks/use-sector.ts
/**
 * useSector — query hook for single Sector detail.
 *
 * Fetches a single Sector by ID within a Predio context.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { prediosService } from '../services';
import { StaleTimes } from '@/shared/lib/query-client';
import type { Sector } from '@ganatrack/shared-types';

export interface UseSectorOptions {
  predioId: number;
  id: number;
}

export interface UseSectorReturn {
  sector: Sector | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useSector(options: UseSectorOptions): UseSectorReturn {
  const { predioId, id } = options;

  const { data, isLoading, error } = useQuery({
    queryKey: ['predios', predioId, 'sectores', id],
    queryFn: () => prediosService.getSector(predioId, id),
    staleTime: StaleTimes.DETAIL,
    enabled: predioId > 0 && id > 0,
  });

  return {
    sector: data,
    isLoading,
    error: error as Error | null,
  };
}
