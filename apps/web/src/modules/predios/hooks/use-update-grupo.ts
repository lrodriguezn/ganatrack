// apps/web/src/modules/predios/hooks/use-update-grupo.ts
/**
 * useUpdateGrupo — mutation hook for updating an existing Grupo.
 *
 * Responsibilities:
 * - Call prediosService.updateGrupo()
 * - Invalidate grupos list and detail queries for the parent Predio
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { Grupo, UpdateGrupoDto } from '@ganatrack/shared-types';

export interface UseUpdateGrupoOptions {
  onSuccess?: (grupo: Grupo) => void;
  onError?: (error: Error) => void;
}

export interface UseUpdateGrupoReturn {
  mutate: (predioId: number, grupoId: number, data: UpdateGrupoDto) => void;
  mutateAsync: (predioId: number, grupoId: number, data: UpdateGrupoDto) => Promise<Grupo>;
  isLoading: boolean;
  error: Error | null;
}

export function useUpdateGrupo(
  options: UseUpdateGrupoOptions = {},
): UseUpdateGrupoReturn {
  const { onSuccess, onError } = options;

  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({
      predioId,
      grupoId,
      data,
    }: {
      predioId: number;
      grupoId: number;
      data: UpdateGrupoDto;
    }) => prediosService.updateGrupo(predioId, grupoId, data),

    onMutate: async ({ predioId, grupoId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.predios.grupos(predioId) });

      // Snapshot previous values
      const previousList =
        queryClient.getQueryData<Grupo[]>(queryKeys.predios.grupos(predioId));
      const previousDetail =
        queryClient.getQueryData<Grupo>(['predios', predioId, 'grupos', grupoId]);

      return { previousList, previousDetail };
    },

    onError: (err, { predioId, grupoId }, context) => {
      // Rollback list
      if (context?.previousList) {
        queryClient.setQueryData(
          queryKeys.predios.grupos(predioId),
          context.previousList,
        );
      }

      // Rollback detail
      if (context?.previousDetail) {
        queryClient.setQueryData(
          ['predios', predioId, 'grupos', grupoId],
          context.previousDetail,
        );
      }

      onError?.(err as Error);
    },

    onSuccess: (updatedGrupo) => {
      // Invalidate list and detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.grupos(updatedGrupo.predioId),
      });
      queryClient.invalidateQueries({
        queryKey: ['predios', updatedGrupo.predioId, 'grupos', updatedGrupo.id],
      });

      onSuccess?.(updatedGrupo);
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.grupos(variables.predioId),
      });
      queryClient.invalidateQueries({
        queryKey: ['predios', variables.predioId, 'grupos', variables.grupoId],
      });
    },
  });

  const wrappedMutate = (predioId: number, grupoId: number, data: UpdateGrupoDto) => {
    mutate({ predioId: predioId, grupoId, data });
  };

  const wrappedMutateAsync = async (predioId: number, grupoId: number, data: UpdateGrupoDto): Promise<Grupo> => {
    return mutateAsync({ predioId: predioId, grupoId, data });
  };

  return {
    mutate: wrappedMutate,
    mutateAsync: wrappedMutateAsync,
    isLoading: isPending,
    error: error as Error | null,
  };
}
