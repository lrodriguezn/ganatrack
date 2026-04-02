// apps/web/src/modules/predios/hooks/use-predios.ts
/**
 * usePredios — query hook for paginated predios list with search filter.
 *
 * Fetches all predios and filters client-side by nombre (search).
 * For server-side pagination, use offset/limit params in service.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';

export interface UsePrediosOptions {
  search?: string;
}

export interface UsePrediosReturn {
  predios: ReturnType<typeof prediosService.getPredios> extends Promise<infer T> ? T : never;
  isLoading: boolean;
  error: Error | null;
}

export function usePredios(options: UsePrediosOptions = {}): UsePrediosReturn {
  const { search = '' } = options;

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.predios.list({ search }),
    queryFn: async () => {
      const all = await prediosService.getPredios();

      // Client-side search filter
      if (!search.trim()) {
        return all;
      }

      const searchLower = search.toLowerCase().trim();
      return all.filter((predio) =>
        predio.nombre.toLowerCase().includes(searchLower),
      );
    },
    staleTime: StaleTimes.LIST,
  });

  return {
    predios: data ?? [],
    isLoading,
    error: error as Error | null,
  };
}
