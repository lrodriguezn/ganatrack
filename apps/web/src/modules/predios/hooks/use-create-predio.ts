// apps/web/src/modules/predios/hooks/use-create-predio.ts
/**
 * useCreatePredio — mutation hook for creating a new Predio.
 *
 * Responsibilities:
 * - Call prediosService.createPredio()
 * - Optimistic update: add new Predio to query cache
 * - Invalidate predios list query
 * - Sync with usePredioStore (add to store predios list)
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { usePredioStore } from '@/store/predio.store';
import type { Predio, CreatePredioDto } from '@ganatrack/shared-types';

export interface UseCreatePredioOptions {
  onSuccess?: (predio: Predio) => void;
  onError?: (error: Error) => void;
}

export interface UseCreatePredioReturn {
  mutate: (data: CreatePredioDto) => void;
  mutateAsync: (data: CreatePredioDto) => Promise<Predio>;
  isLoading: boolean;
  error: Error | null;
}

export function useCreatePredio(
  options: UseCreatePredioOptions = {},
): UseCreatePredioReturn {
  const { onSuccess, onError } = options;

  const queryClient = useQueryClient();
  const setPredios = usePredioStore((s) => s.setPredios);

  const { mutate, mutateAsync, isPending, error, reset } = useMutation({
    mutationFn: (data: CreatePredioDto) => prediosService.createPredio(data),

    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.predios.all });

      // Snapshot previous value
      const previousPredios =
        queryClient.getQueryData<Predio[]>(queryKeys.predios.lists());

      // Optimistic Predio with temporary ID
      const optimisticPredio: Predio = {
        id: Date.now(),
        codigo: data.codigo,
        nombre: data.nombre,
        departamento: data.departamento ?? null,
        municipio: data.municipio ?? null,
        vereda: data.vereda ?? null,
        areaHectareas: data.areaHectareas ?? null,
        capacidadMaxima: data.capacidadMaxima ?? null,
        tipoExplotacionId: data.tipoExplotacionId ?? null,
      };

      // Optimistic update to list
      queryClient.setQueryData<Predio[]>(
        queryKeys.predios.lists(),
        (old = []) => [...old, optimisticPredio],
      );

      return { previousPredios };
    },

    onError: (err, _data, context) => {
      // Rollback to previous value
      if (context?.previousPredios) {
        queryClient.setQueryData(
          queryKeys.predios.lists(),
          context.previousPredios,
        );
      }

      onError?.(err as Error);
    },

    onSuccess: (newPredio) => {
      // Update list with real data (replace optimistic)
      queryClient.setQueryData<Predio[]>(
        queryKeys.predios.lists(),
        (old = []) => {
          return old.map((p) =>
            p.id === newPredio.id ? newPredio : p,
          );
        },
      );

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.predios.all });

      // Sync with store
      const currentPredios = usePredioStore.getState().predios;
      const exists = currentPredios.some((p) => p.id === newPredio.id);
      if (!exists) {
        setPredios([...currentPredios, newPredio]);
      }

      onSuccess?.(newPredio);
    },

    onSettled: () => {
      // Always refetch after error or success
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
