// apps/web/src/modules/predios/hooks/use-grupos.ts
/**
 * useGrupos — query hook for grupos of a specific Predio.
 *
 * Fetches all grupos belonging to a Predio.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';
import type { Grupo } from '@ganatrack/shared-types';

export interface UseGruposOptions {
  predioId: number;
}

export interface UseGruposReturn {
  grupos: Grupo[];
  isLoading: boolean;
  error: Error | null;
}

export function useGrupos(options: UseGruposOptions): UseGruposReturn {
  const { predioId } = options;

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.predios.grupos(predioId),
    queryFn: () => prediosService.getGrupos(predioId),
    staleTime: StaleTimes.LIST,
    enabled: predioId > 0,
  });

  return {
    grupos: data ?? [],
    isLoading,
    error: error as Error | null,
  };
}
