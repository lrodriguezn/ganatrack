// apps/web/src/modules/predios/hooks/use-create-grupo.ts
/**
 * useCreateGrupo — mutation hook for creating a new Grupo.
 *
 * Responsibilities:
 * - Call prediosService.createGrupo()
 * - Invalidate grupos list query for the parent Predio
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { Grupo, CreateGrupoDto } from '@ganatrack/shared-types';

export interface UseCreateGrupoOptions {
  onSuccess?: (grupo: Grupo) => void;
  onError?: (error: Error) => void;
}

export interface UseCreateGrupoReturn {
  mutate: (predioId: number, data: CreateGrupoDto) => void;
  mutateAsync: (predioId: number, data: CreateGrupoDto) => Promise<Grupo>;
  isLoading: boolean;
  error: Error | null;
}

export function useCreateGrupo(
  options: UseCreateGrupoOptions = {},
): UseCreateGrupoReturn {
  const { onSuccess, onError } = options;

  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ predioId, data }: { predioId: number; data: CreateGrupoDto }) =>
      prediosService.createGrupo(predioId, data),

    onMutate: async ({ predioId: pId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.predios.grupos(pId) });

      // Snapshot previous value
      const previousGrupos =
        queryClient.getQueryData<Grupo[]>(queryKeys.predios.grupos(pId));

      return { previousGrupos };
    },

    onError: (err, _variables, context) => {
      // Rollback to previous value
      if (context?.previousGrupos) {
        queryClient.setQueryData(
          queryKeys.predios.grupos(0),
          context.previousGrupos,
        );
      }

      onError?.(err as Error);
    },

    onSuccess: (newGrupo) => {
      // Invalidate grupos list for this Predio
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.grupos(newGrupo.predioId),
      });

      onSuccess?.(newGrupo);
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.grupos(variables.predioId),
      });
    },
  });

  const wrappedMutate = (predioId: number, data: CreateGrupoDto) => {
    mutate({ predioId: predioId, data });
  };

  const wrappedMutateAsync = async (predioId: number, data: CreateGrupoDto): Promise<Grupo> => {
    return mutateAsync({ predioId: predioId, data });
  };

  return {
    mutate: wrappedMutate,
    mutateAsync: wrappedMutateAsync,
    isLoading: isPending,
    error: error as Error | null,
  };
}
