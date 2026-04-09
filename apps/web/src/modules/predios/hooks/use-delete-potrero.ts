// apps/web/src/modules/predios/hooks/use-delete-potrero.ts
/**
 * useDeletePotrero — mutation hook for deleting a Potrero.
 *
 * Responsibilities:
 * - Call prediosService.deletePotrero()
 * - Invalidate potreros list query for the parent Predio
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { Potrero } from '@ganatrack/shared-types';

export interface UseDeletePotreroOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseDeletePotreroReturn {
  mutate: (predioId: number, potreroId: number) => void;
  mutateAsync: (predioId: number, potreroId: number) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export function useDeletePotrero(
  options: UseDeletePotreroOptions = {},
): UseDeletePotreroReturn {
  const { onSuccess, onError } = options;

  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ predioId, potreroId }: { predioId: number; potreroId: number }) =>
      prediosService.deletePotrero(predioId, potreroId),

    onMutate: async ({ predioId, potreroId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.predios.potreros(predioId) });

      // Snapshot previous value
      const previousList =
        queryClient.getQueryData<Potrero[]>(queryKeys.predios.potreros(predioId));

      // Optimistic remove from list
      if (previousList) {
        queryClient.setQueryData<Potrero[]>(
          queryKeys.predios.potreros(predioId),
          old => old?.filter(p => p.id !== potreroId),
        );
      }

      return { previousList, deletedId: potreroId };
    },

    onError: (err, { predioId }, context) => {
      // Rollback to previous value
      if (context?.previousList) {
        queryClient.setQueryData(
          queryKeys.predios.potreros(predioId),
          context.previousList,
        );
      }

      onError?.(err as Error);
    },

    onSuccess: (_void, { predioId }) => {
      // Invalidate potreros list for this Predio
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.potreros(predioId),
      });

      onSuccess?.();
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.potreros(variables.predioId),
      });
    },
  });

  const wrappedMutate = (predioId: number, potreroId: number) => {
    mutate({ predioId, potreroId });
  };

  const wrappedMutateAsync = async (predioId: number, potreroId: number): Promise<void> => {
    return mutateAsync({ predioId, potreroId });
  };

  return {
    mutate: wrappedMutate,
    mutateAsync: wrappedMutateAsync,
    isLoading: isPending,
    error: error as Error | null,
  };
}
