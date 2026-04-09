// apps/web/src/modules/predios/hooks/use-update-sector.ts
/**
 * useUpdateSector — mutation hook for updating an existing Sector.
 *
 * Responsibilities:
 * - Call prediosService.updateSector()
 * - Invalidate sectores list and detail queries for the parent Predio
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { Sector, UpdateSectorDto } from '@ganatrack/shared-types';

export interface UseUpdateSectorOptions {
  onSuccess?: (sector: Sector) => void;
  onError?: (error: Error) => void;
}

export interface UseUpdateSectorReturn {
  mutate: (predioId: number, sectorId: number, data: UpdateSectorDto) => void;
  mutateAsync: (predioId: number, sectorId: number, data: UpdateSectorDto) => Promise<Sector>;
  isLoading: boolean;
  error: Error | null;
}

export function useUpdateSector(
  options: UseUpdateSectorOptions = {},
): UseUpdateSectorReturn {
  const { onSuccess, onError } = options;

  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({
      predioId,
      sectorId,
      data,
    }: {
      predioId: number;
      sectorId: number;
      data: UpdateSectorDto;
    }) => prediosService.updateSector(predioId, sectorId, data),

    onMutate: async ({ predioId, sectorId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.predios.sectores(predioId) });

      // Snapshot previous values
      const previousList =
        queryClient.getQueryData<Sector[]>(queryKeys.predios.sectores(predioId));
      const previousDetail =
        queryClient.getQueryData<Sector>(['predios', predioId, 'sectores', sectorId]);

      return { previousList, previousDetail };
    },

    onError: (err, { predioId, sectorId }, context) => {
      // Rollback list
      if (context?.previousList) {
        queryClient.setQueryData(
          queryKeys.predios.sectores(predioId),
          context.previousList,
        );
      }

      // Rollback detail
      if (context?.previousDetail) {
        queryClient.setQueryData(
          ['predios', predioId, 'sectores', sectorId],
          context.previousDetail,
        );
      }

      onError?.(err as Error);
    },

    onSuccess: (updatedSector) => {
      // Invalidate list and detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.sectores(updatedSector.predioId),
      });
      queryClient.invalidateQueries({
        queryKey: ['predios', updatedSector.predioId, 'sectores', updatedSector.id],
      });

      onSuccess?.(updatedSector);
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.sectores(variables.predioId),
      });
      queryClient.invalidateQueries({
        queryKey: ['predios', variables.predioId, 'sectores', variables.sectorId],
      });
    },
  });

  const wrappedMutate = (predioId: number, sectorId: number, data: UpdateSectorDto) => {
    mutate({ predioId: predioId, sectorId, data });
  };

  const wrappedMutateAsync = async (predioId: number, sectorId: number, data: UpdateSectorDto): Promise<Sector> => {
    return mutateAsync({ predioId: predioId, sectorId, data });
  };

  return {
    mutate: wrappedMutate,
    mutateAsync: wrappedMutateAsync,
    isLoading: isPending,
    error: error as Error | null,
  };
}
