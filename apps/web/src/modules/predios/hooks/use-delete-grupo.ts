// apps/web/src/modules/predios/hooks/use-delete-grupo.ts
/**
 * useDeleteGrupo — mutation hook for deleting a Grupo.
 *
 * Responsibilities:
 * - Call prediosService.deleteGrupo()
 * - Invalidate grupos list query for the parent Predio
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { Grupo } from '@ganatrack/shared-types';

export interface UseDeleteGrupoOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseDeleteGrupoReturn {
  mutate: (predioId: number, grupoId: number) => void;
  mutateAsync: (predioId: number, grupoId: number) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export function useDeleteGrupo(
  options: UseDeleteGrupoOptions = {},
): UseDeleteGrupoReturn {
  const { onSuccess, onError } = options;

  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ predioId, grupoId }: { predioId: number; grupoId: number }) =>
      prediosService.deleteGrupo(predioId, grupoId),

    onMutate: async ({ predioId, grupoId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.predios.grupos(predioId) });

      // Snapshot previous value
      const previousList =
        queryClient.getQueryData<Grupo[]>(queryKeys.predios.grupos(predioId));

      // Optimistic remove from list
      if (previousList) {
        queryClient.setQueryData<Grupo[]>(
          queryKeys.predios.grupos(predioId),
          old => old?.filter(g => g.id !== grupoId),
        );
      }

      return { previousList, deletedId: grupoId };
    },

    onError: (err, { predioId }, context) => {
      // Rollback to previous value
      if (context?.previousList) {
        queryClient.setQueryData(
          queryKeys.predios.grupos(predioId),
          context.previousList,
        );
      }

      onError?.(err as Error);
    },

    onSuccess: (_void, { predioId }) => {
      // Invalidate grupos list for this Predio
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.grupos(predioId),
      });

      onSuccess?.();
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.grupos(variables.predioId),
      });
    },
  });

  const wrappedMutate = (predioId: number, grupoId: number) => {
    mutate({ predioId, grupoId });
  };

  const wrappedMutateAsync = async (predioId: number, grupoId: number): Promise<void> => {
    return mutateAsync({ predioId, grupoId });
  };

  return {
    mutate: wrappedMutate,
    mutateAsync: wrappedMutateAsync,
    isLoading: isPending,
    error: error as Error | null,
  };
}
