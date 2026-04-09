// apps/web/src/modules/predios/hooks/use-grupo.ts
/**
 * useGrupo — query hook for single Grupo detail.
 *
 * Fetches a single Grupo by ID within a Predio context.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { prediosService } from '../services';
import { StaleTimes } from '@/shared/lib/query-client';
import type { Grupo } from '@ganatrack/shared-types';

export interface UseGrupoOptions {
  predioId: number;
  id: number;
}

export interface UseGrupoReturn {
  grupo: Grupo | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useGrupo(options: UseGrupoOptions): UseGrupoReturn {
  const { predioId, id } = options;

  const { data, isLoading, error } = useQuery({
    queryKey: ['predios', predioId, 'grupos', id],
    queryFn: () => prediosService.getGrupo(predioId, id),
    staleTime: StaleTimes.DETAIL,
    enabled: predioId > 0 && id > 0,
  });

  return {
    grupo: data,
    isLoading,
    error: error as Error | null,
  };
}
