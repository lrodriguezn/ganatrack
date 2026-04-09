// apps/web/src/modules/predios/hooks/use-delete-lote.ts
/**
 * useDeleteLote — mutation hook for deleting a Lote.
 *
 * Responsibilities:
 * - Call prediosService.deleteLote()
 * - Invalidate lotes list query for the parent Predio
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { Lote } from '@ganatrack/shared-types';

export interface UseDeleteLoteOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseDeleteLoteReturn {
  mutate: (predioId: number, loteId: number) => void;
  mutateAsync: (predioId: number, loteId: number) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export function useDeleteLote(
  options: UseDeleteLoteOptions = {},
): UseDeleteLoteReturn {
  const { onSuccess, onError } = options;

  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ predioId, loteId }: { predioId: number; loteId: number }) =>
      prediosService.deleteLote(predioId, loteId),

    onMutate: async ({ predioId, loteId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.predios.lotes(predioId) });

      // Snapshot previous value
      const previousList =
        queryClient.getQueryData<Lote[]>(queryKeys.predios.lotes(predioId));

      // Optimistic remove from list
      if (previousList) {
        queryClient.setQueryData<Lote[]>(
          queryKeys.predios.lotes(predioId),
          old => old?.filter(l => l.id !== loteId),
        );
      }

      return { previousList, deletedId: loteId };
    },

    onError: (err, { predioId }, context) => {
      // Rollback to previous value
      if (context?.previousList) {
        queryClient.setQueryData(
          queryKeys.predios.lotes(predioId),
          context.previousList,
        );
      }

      onError?.(err as Error);
    },

    onSuccess: (_void, { predioId }) => {
      // Invalidate lotes list for this Predio
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.lotes(predioId),
      });

      onSuccess?.();
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.lotes(variables.predioId),
      });
    },
  });

  const wrappedMutate = (predioId: number, loteId: number) => {
    mutate({ predioId, loteId });
  };

  const wrappedMutateAsync = async (predioId: number, loteId: number): Promise<void> => {
    return mutateAsync({ predioId, loteId });
  };

  return {
    mutate: wrappedMutate,
    mutateAsync: wrappedMutateAsync,
    isLoading: isPending,
    error: error as Error | null,
  };
}
