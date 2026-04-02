// apps/web/src/modules/predios/hooks/use-update-predio.ts
/**
 * useUpdatePredio — mutation hook for updating an existing Predio.
 *
 * Responsibilities:
 * - Call prediosService.updatePredio()
 * - Optimistic update: update Predio in query cache
 * - Invalidate predios list and detail queries
 * - Sync with usePredioStore (update in store predios list)
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { usePredioStore } from '@/store/predio.store';
import type { Predio, UpdatePredioDto } from '@ganatrack/shared-types';

export interface UseUpdatePredioOptions {
  onSuccess?: (predio: Predio) => void;
  onError?: (error: Error) => void;
}

export interface UseUpdatePredioReturn {
  mutate: (id: number, data: UpdatePredioDto) => void;
  mutateAsync: (id: number, data: UpdatePredioDto) => Promise<Predio>;
  isLoading: boolean;
  error: Error | null;
}

export function useUpdatePredio(
  options: UseUpdatePredioOptions = {},
): UseUpdatePredioReturn {
  const { onSuccess, onError } = options;

  const queryClient = useQueryClient();
  const setPredios = usePredioStore((s) => s.setPredios);

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdatePredioDto;
    }) => prediosService.updatePredio(id, data),

    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.predios.all });

      // Snapshot previous values
      const previousList =
        queryClient.getQueryData<Predio[]>(queryKeys.predios.lists());
      const previousDetail =
        queryClient.getQueryData<Predio>(queryKeys.predios.detail(id));

      // Optimistic update to list
      if (previousList) {
        queryClient.setQueryData<Predio[]>(
          queryKeys.predios.lists(),
          old => old?.map(p => p.id === id ? { ...p, ...data } : p),
        );
      }

      // Optimistic update to detail
      if (previousDetail) {
        queryClient.setQueryData<Predio>(
          queryKeys.predios.detail(id),
          { ...previousDetail, ...data },
        );
      }

      return { previousList, previousDetail };
    },

    onError: (err, { id }, context) => {
      // Rollback list
      if (context?.previousList) {
        queryClient.setQueryData(
          queryKeys.predios.lists(),
          context.previousList,
        );
      }

      // Rollback detail
      if (context?.previousDetail) {
        queryClient.setQueryData(
          queryKeys.predios.detail(id),
          context.previousDetail,
        );
      }

      onError?.(err as Error);
    },

    onSuccess: (updatedPredio) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.predios.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.detail(updatedPredio.id),
      });

      // Sync with store
      const currentPredios = usePredioStore.getState().predios;
      setPredios(
        currentPredios.map(p =>
          p.id === updatedPredio.id ? updatedPredio : p,
        ),
      );

      // Also update activo if it's the active predio
      const activo = usePredioStore.getState().predioActivo;
      if (activo?.id === updatedPredio.id) {
        usePredioStore.getState().switchPredio(updatedPredio.id);
      }

      onSuccess?.(updatedPredio);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.predios.all });
    },
  });

  return {
    mutate: (id, data) => mutate({ id, data }),
    mutateAsync: (id, data) => mutate({ id, data }),
    isLoading: isPending,
    error: error as Error | null,
  };
}
