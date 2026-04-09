// apps/web/src/modules/predios/hooks/use-create-potrero.ts
/**
 * useCreatePotrero — mutation hook for creating a new Potrero.
 *
 * Responsibilities:
 * - Call prediosService.createPotrero()
 * - Invalidate potreros list query for the parent Predio
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { Potrero, CreatePotreroDto } from '@ganatrack/shared-types';

export interface UseCreatePotreroOptions {
  onSuccess?: (potrero: Potrero) => void;
  onError?: (error: Error) => void;
}

export interface UseCreatePotreroReturn {
  mutate: (predioId: number, data: CreatePotreroDto) => void;
  mutateAsync: (predioId: number, data: CreatePotreroDto) => Promise<Potrero>;
  isLoading: boolean;
  error: Error | null;
}

export function useCreatePotrero(
  options: UseCreatePotreroOptions = {},
): UseCreatePotreroReturn {
  const { onSuccess, onError } = options;

  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: (variables: { predioId: number; data: CreatePotreroDto }) =>
      prediosService.createPotrero(variables.predioId, variables.data),

    onMutate: async ({ predioId: pId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.predios.potreros(pId) });

      // Snapshot previous value
      const previousPotreros =
        queryClient.getQueryData<Potrero[]>(queryKeys.predios.potreros(pId));

      return { previousPotreros };
    },

    onError: (err, _variables, context) => {
      // Rollback to previous value
      if (context?.previousPotreros) {
        queryClient.setQueryData(
          queryKeys.predios.potreros(0),
          context.previousPotreros,
        );
      }

      onError?.(err as Error);
    },

    onSuccess: (newPotrero) => {
      // Invalidate potreros list for this Predio
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.potreros(newPotrero.predioId),
      });

      onSuccess?.(newPotrero);
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.potreros(variables.predioId),
      });
    },
  });

  const wrappedMutate = (predioId: number, data: CreatePotreroDto) => {
    mutate({ predioId, data });
  };

  const wrappedMutateAsync = async (predioId: number, data: CreatePotreroDto): Promise<Potrero> => {
    return mutateAsync({ predioId, data });
  };

  return {
    mutate: wrappedMutate,
    mutateAsync: wrappedMutateAsync,
    isLoading: isPending,
    error: error as Error | null,
  };
}
