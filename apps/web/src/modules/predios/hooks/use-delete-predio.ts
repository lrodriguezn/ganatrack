// apps/web/src/modules/predios/hooks/use-delete-predio.ts
/**
 * useDeletePredio — mutation hook for deleting a Predio.
 *
 * Responsibilities:
 * - Call prediosService.deletePredio()
 * - Optimistic update: remove Predio from query cache
 * - Invalidate queries
 * - Sync with usePredioStore (remove from store predios list)
 * - If deleted predio is activo, switch to next available
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { usePredioStore } from '@/store/predio.store';
import type { Predio } from '@ganatrack/shared-types';

export interface UseDeletePredioOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseDeletePredioReturn {
  mutate: (id: number) => void;
  mutateAsync: (id: number) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export function useDeletePredio(
  options: UseDeletePredioOptions = {},
): UseDeletePredioReturn {
  const { onSuccess, onError } = options;

  const queryClient = useQueryClient();
  const { predios, switchPredio, setPredios } = usePredioStore.getState();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: (id: number) => prediosService.deletePredio(id),

    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.predios.all });

      // Snapshot previous value
      const previousList =
        queryClient.getQueryData<Predio[]>(queryKeys.predios.lists());

      // Optimistic remove from list
      queryClient.setQueryData<Predio[]>(
        queryKeys.predios.lists(),
        old => old?.filter(p => p.id !== id),
      );

      return { previousList, deletedId: id };
    },

    onError: (err, _id, context) => {
      // Rollback to previous value
      if (context?.previousList) {
        queryClient.setQueryData(
          queryKeys.predios.lists(),
          context.previousList,
        );
      }

      onError?.(err as Error);
    },

    onSuccess: (_void, deletedId) => {
      // Invalidate all predios queries
      queryClient.invalidateQueries({ queryKey: queryKeys.predios.all });

      // Sync with store
      const currentPredios = usePredioStore.getState().predios;
      const updatedPredios = currentPredios.filter(p => p.id !== deletedId);
      setPredios(updatedPredios);

      // If deleted the activo predio, switch to next available
      const activo = usePredioStore.getState().predioActivo;
      if (activo?.id === deletedId) {
        if (updatedPredios.length > 0) {
          switchPredio(updatedPredios[0].id);
        }
      }

      onSuccess?.();
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.predios.all });
    },
  });

  return {
    mutate,
    mutateAsync,
    isLoading: isPending,
    error: error as Error | null,
  };
}
