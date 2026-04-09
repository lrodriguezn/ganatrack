// apps/web/src/modules/predios/hooks/use-update-potrero.ts
/**
 * useUpdatePotrero — mutation hook for updating an existing Potrero.
 *
 * Responsibilities:
 * - Call prediosService.updatePotrero()
 * - Invalidate potreros list and detail queries for the parent Predio
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { Potrero, UpdatePotreroDto } from '@ganatrack/shared-types';

export interface UseUpdatePotreroOptions {
  onSuccess?: (potrero: Potrero) => void;
  onError?: (error: Error) => void;
}

export interface UseUpdatePotreroReturn {
  mutate: (predioId: number, potreroId: number, data: UpdatePotreroDto) => void;
  mutateAsync: (predioId: number, potreroId: number, data: UpdatePotreroDto) => Promise<Potrero>;
  isLoading: boolean;
  error: Error | null;
}

export function useUpdatePotrero(
  options: UseUpdatePotreroOptions = {},
): UseUpdatePotreroReturn {
  const { onSuccess, onError } = options;

  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({
      predioId,
      potreroId,
      data,
    }: {
      predioId: number;
      potreroId: number;
      data: UpdatePotreroDto;
    }) => prediosService.updatePotrero(predioId, potreroId, data),

    onMutate: async ({ predioId, potreroId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.predios.potreros(predioId) });

      // Snapshot previous values
      const previousList =
        queryClient.getQueryData<Potrero[]>(queryKeys.predios.potreros(predioId));
      const previousDetail =
        queryClient.getQueryData<Potrero>(['predios', predioId, 'potreros', potreroId]);

      return { previousList, previousDetail };
    },

    onError: (err, { predioId, potreroId }, context) => {
      // Rollback list
      if (context?.previousList) {
        queryClient.setQueryData(
          queryKeys.predios.potreros(predioId),
          context.previousList,
        );
      }

      // Rollback detail
      if (context?.previousDetail) {
        queryClient.setQueryData(
          ['predios', predioId, 'potreros', potreroId],
          context.previousDetail,
        );
      }

      onError?.(err as Error);
    },

    onSuccess: (updatedPotrero) => {
      // Invalidate list and detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.potreros(updatedPotrero.predioId),
      });
      queryClient.invalidateQueries({
        queryKey: ['predios', updatedPotrero.predioId, 'potreros', updatedPotrero.id],
      });

      onSuccess?.(updatedPotrero);
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.potreros(variables.predioId),
      });
      queryClient.invalidateQueries({
        queryKey: ['predios', variables.predioId, 'potreros', variables.potreroId],
      });
    },
  });

  const wrappedMutate = (predioId: number, potreroId: number, data: UpdatePotreroDto) => {
    mutate({ predioId: predioId, potreroId, data });
  };

  const wrappedMutateAsync = async (predioId: number, potreroId: number, data: UpdatePotreroDto): Promise<Potrero> => {
    return mutateAsync({ predioId: predioId, potreroId, data });
  };

  return {
    mutate: wrappedMutate,
    mutateAsync: wrappedMutateAsync,
    isLoading: isPending,
    error: error as Error | null,
  };
}
