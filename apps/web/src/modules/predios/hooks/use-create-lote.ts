// apps/web/src/modules/predios/hooks/use-create-lote.ts
/**
 * useCreateLote — mutation hook for creating a new Lote.
 *
 * Responsibilities:
 * - Call prediosService.createLote()
 * - Invalidate lotes list query for the parent Predio
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { Lote, CreateLoteDto } from '@ganatrack/shared-types';

export interface UseCreateLoteOptions {
  onSuccess?: (lote: Lote) => void;
  onError?: (error: Error) => void;
}

export interface UseCreateLoteReturn {
  mutate: (predioId: number, data: CreateLoteDto) => void;
  mutateAsync: (predioId: number, data: CreateLoteDto) => Promise<Lote>;
  isLoading: boolean;
  error: Error | null;
}

export function useCreateLote(
  options: UseCreateLoteOptions = {},
): UseCreateLoteReturn {
  const { onSuccess, onError } = options;

  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ predioId, data }: { predioId: number; data: CreateLoteDto }) =>
      prediosService.createLote(predioId, data),

    onMutate: async ({ predioId: pId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.predios.lotes(pId) });

      // Snapshot previous value
      const previousLotes =
        queryClient.getQueryData<Lote[]>(queryKeys.predios.lotes(pId));

      return { previousLotes };
    },

    onError: (err, _variables, context) => {
      // Rollback to previous value
      if (context?.previousLotes) {
        queryClient.setQueryData(
          queryKeys.predios.lotes(0),
          context.previousLotes,
        );
      }

      onError?.(err as Error);
    },

    onSuccess: (newLote) => {
      // Invalidate lotes list for this Predio
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.lotes(newLote.predioId),
      });

      onSuccess?.(newLote);
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.lotes(variables.predioId),
      });
    },
  });

  const wrappedMutate = (predioId: number, data: CreateLoteDto) => {
    mutate({ predioId: predioId, data });
  };

  const wrappedMutateAsync = async (predioId: number, data: CreateLoteDto): Promise<Lote> => {
    return mutateAsync({ predioId: predioId, data });
  };

  return {
    mutate: wrappedMutate,
    mutateAsync: wrappedMutateAsync,
    isLoading: isPending,
    error: error as Error | null,
  };
}
