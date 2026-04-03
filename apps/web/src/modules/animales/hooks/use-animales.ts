// apps/web/src/modules/animales/hooks/use-animales.ts
/**
 * useAnimales — paginated animal list with server-side filters.
 *
 * @example
 * const { data, isLoading, error, refetch } = useAnimales({
 *   predioId: 1,
 *   page: 1,
 *   limit: 10,
 *   sexoKey: 0,
 * });
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { animalService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';
import type { AnimalFilters } from '../types/animal.types';

export function useAnimales(filters: AnimalFilters) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.animales.list(filters),
    queryFn: () => animalService.getAll(filters),
    staleTime: StaleTimes.LIST,
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}