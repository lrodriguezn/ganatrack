// apps/web/src/modules/usuarios/hooks/use-roles-permisos.ts
/**
 * useRolesPermisos — hook for fetching/updating role permissions matrix
 * with optimistic updates.
 *
 * @example
 * const { data: matrix, updatePermisos, isPending } = useRolesPermisos(1);
 * await updatePermisos({ rolId: 1, permisos: [...] });
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';
import type { BatchSavePermisosPayload, PermisoMatrixState } from '../types/roles.types';

export function useRolesPermisos(rolId: number) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.usuarios.rolePermisos(rolId),
    queryFn: () => usuariosService.getRolPermisos(rolId),
    staleTime: StaleTimes.DETAIL,
    enabled: rolId > 0,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: BatchSavePermisosPayload) =>
      usuariosService.updateRolPermisos(payload),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.usuarios.rolePermisos(newData.rolId),
      });

      // Snapshot previous value
      const previous = queryClient.getQueryData<PermisoMatrixState>(
        queryKeys.usuarios.rolePermisos(newData.rolId),
      );

      // Optimistically update
      if (previous) {
        queryClient.setQueryData<PermisoMatrixState>(
          queryKeys.usuarios.rolePermisos(newData.rolId),
          {
            ...previous,
            cells: previous.cells.map((cell) => {
              const updated = newData.permisos.find(
                (p) => p.modulo === cell.modulo && p.accion === cell.accion,
              );
              return updated ? { ...cell, enabled: updated.enabled } : cell;
            }),
            isDirty: true,
          },
        );
      }

      return { previous };
    },
    onError: (_err, _newData, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.usuarios.rolePermisos(_newData.rolId),
          context.previous,
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.usuarios.rolePermisos(variables.rolId),
      });
    },
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    updatePermisos: updateMutation.mutateAsync,
    isPending: updateMutation.isPending,
  };
}
