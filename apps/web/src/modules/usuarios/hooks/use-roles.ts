// apps/web/src/modules/usuarios/hooks/use-roles.ts
/**
 * useRoles — hook for fetching all roles.
 *
 * @example
 * const { data: roles, isLoading } = useRoles();
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { usuariosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';

export function useRoles() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.usuarios.roles(),
    queryFn: () => usuariosService.getRoles(),
    staleTime: StaleTimes.CATALOG,
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
