// apps/web/src/modules/usuarios/hooks/use-usuarios.ts
/**
 * useUsuarios — paginated usuario list with server-side filters.
 *
 * @example
 * const { data, isLoading, error, refetch } = useUsuarios({
 *   predioId: 1,
 *   page: 1,
 *   limit: 10,
 *   search: 'carlos',
 * });
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { usuariosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';
import type { UsuarioFilters } from '../types/usuarios.types';

export function useUsuarios(filters: UsuarioFilters) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.usuarios.list(filters),
    queryFn: () => usuariosService.getAll(filters),
    staleTime: StaleTimes.LIST,
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
