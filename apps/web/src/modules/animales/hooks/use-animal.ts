// apps/web/src/modules/animales/hooks/use-animal.ts
/**
 * useAnimal — single animal detail query.
 *
 * @example
 * const { data, isLoading, error } = useAnimal(123);
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { animalService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';

export function useAnimal(id: number) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.animales.detail(id),
    queryFn: () => animalService.getById(id),
    staleTime: StaleTimes.DETAIL,
    enabled: id > 0,
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}