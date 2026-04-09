// apps/web/src/modules/predios/hooks/use-update-lote.ts
/**
 * useUpdateLote — mutation hook for updating an existing Lote.
 *
 * Responsibilities:
 * - Call prediosService.updateLote()
 * - Invalidate lotes list and detail queries for the parent Predio
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { Lote, UpdateLoteDto } from '@ganatrack/shared-types';

export interface UseUpdateLoteOptions {
  onSuccess?: (lote: Lote) => void;
  onError?: (error: Error) => void;
}

export interface UseUpdateLoteReturn {
  mutate: (predioId: number, loteId: number, data: UpdateLoteDto) => void;
  mutateAsync: (predioId: number, loteId: number, data: UpdateLoteDto) => Promise<Lote>;
  isLoading: boolean;
  error: Error | null;
}

export function useUpdateLote(
  options: UseUpdateLoteOptions = {},
): UseUpdateLoteReturn {
  const { onSuccess, onError } = options;

  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({
      predioId,
      loteId,
      data,
    }: {
      predioId: number;
      loteId: number;
      data: UpdateLoteDto;
    }) => prediosService.updateLote(predioId, loteId, data),

    onMutate: async ({ predioId, loteId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.predios.lotes(predioId) });

      // Snapshot previous values
      const previousList =
        queryClient.getQueryData<Lote[]>(queryKeys.predios.lotes(predioId));
      const previousDetail =
        queryClient.getQueryData<Lote>(['predios', predioId, 'lotes', loteId]);

      return { previousList, previousDetail };
    },

    onError: (err, { predioId, loteId }, context) => {
      // Rollback list
      if (context?.previousList) {
        queryClient.setQueryData(
          queryKeys.predios.lotes(predioId),
          context.previousList,
        );
      }

      // Rollback detail
      if (context?.previousDetail) {
        queryClient.setQueryData(
          ['predios', predioId, 'lotes', loteId],
          context.previousDetail,
        );
      }

      onError?.(err as Error);
    },

    onSuccess: (updatedLote) => {
      // Invalidate list and detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.lotes(updatedLote.predioId),
      });
      queryClient.invalidateQueries({
        queryKey: ['predios', updatedLote.predioId, 'lotes', updatedLote.id],
      });

      onSuccess?.(updatedLote);
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.lotes(variables.predioId),
      });
      queryClient.invalidateQueries({
        queryKey: ['predios', variables.predioId, 'lotes', variables.loteId],
      });
    },
  });

  const wrappedMutate = (predioId: number, loteId: number, data: UpdateLoteDto) => {
    mutate({ predioId: predioId, loteId, data });
  };

  const wrappedMutateAsync = async (predioId: number, loteId: number, data: UpdateLoteDto): Promise<Lote> => {
    return mutateAsync({ predioId: predioId, loteId, data });
  };

  return {
    mutate: wrappedMutate,
    mutateAsync: wrappedMutateAsync,
    isLoading: isPending,
    error: error as Error | null,
  };
}
