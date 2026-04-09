// apps/web/src/modules/predios/hooks/use-delete-sector.ts
/**
 * useDeleteSector — mutation hook for deleting a Sector.
 *
 * Responsibilities:
 * - Call prediosService.deleteSector()
 * - Invalidate sectores list query for the parent Predio
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { Sector } from '@ganatrack/shared-types';

export interface UseDeleteSectorOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseDeleteSectorReturn {
  mutate: (predioId: number, sectorId: number) => void;
  mutateAsync: (predioId: number, sectorId: number) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export function useDeleteSector(
  options: UseDeleteSectorOptions = {},
): UseDeleteSectorReturn {
  const { onSuccess, onError } = options;

  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ predioId, sectorId }: { predioId: number; sectorId: number }) =>
      prediosService.deleteSector(predioId, sectorId),

    onMutate: async ({ predioId, sectorId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.predios.sectores(predioId) });

      // Snapshot previous value
      const previousList =
        queryClient.getQueryData<Sector[]>(queryKeys.predios.sectores(predioId));

      // Optimistic remove from list
      if (previousList) {
        queryClient.setQueryData<Sector[]>(
          queryKeys.predios.sectores(predioId),
          old => old?.filter(s => s.id !== sectorId),
        );
      }

      return { previousList, deletedId: sectorId };
    },

    onError: (err, { predioId }, context) => {
      // Rollback to previous value
      if (context?.previousList) {
        queryClient.setQueryData(
          queryKeys.predios.sectores(predioId),
          context.previousList,
        );
      }

      onError?.(err as Error);
    },

    onSuccess: (_void, { predioId }) => {
      // Invalidate sectores list for this Predio
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.sectores(predioId),
      });

      onSuccess?.();
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.sectores(variables.predioId),
      });
    },
  });

  const wrappedMutate = (predioId: number, sectorId: number) => {
    mutate({ predioId, sectorId });
  };

  const wrappedMutateAsync = async (predioId: number, sectorId: number): Promise<void> => {
    return mutateAsync({ predioId, sectorId });
  };

  return {
    mutate: wrappedMutate,
    mutateAsync: wrappedMutateAsync,
    isLoading: isPending,
    error: error as Error | null,
  };
}
