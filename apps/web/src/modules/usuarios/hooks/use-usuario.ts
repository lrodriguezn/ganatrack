// apps/web/src/modules/usuarios/hooks/use-usuario.ts
/**
 * useUsuario — single usuario detail hook by ID.
 *
 * @example
 * const { data: usuario, isLoading, error } = useUsuario(1);
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { usuariosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';

export function useUsuario(id: number) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.usuarios.detail(id),
    queryFn: () => usuariosService.getById(id),
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
