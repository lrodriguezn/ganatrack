// apps/web/src/modules/animales/hooks/use-genealogia.ts
/**
 * useGenealogia — genealogy tree query for an animal.
 *
 * @example
 * const { data, isLoading, error } = useGenealogia(123);
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { animalService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';

export function useGenealogia(id: number) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.animales.genealogia(id),
    queryFn: () => animalService.getGenealogia(id),
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