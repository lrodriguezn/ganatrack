// apps/web/src/modules/predios/hooks/use-create-sector.ts
/**
 * useCreateSector — mutation hook for creating a new Sector.
 *
 * Responsibilities:
 * - Call prediosService.createSector()
 * - Invalidate sectores list query for the parent Predio
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { prediosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { Sector, CreateSectorDto } from '@ganatrack/shared-types';

export interface UseCreateSectorOptions {
  onSuccess?: (sector: Sector) => void;
  onError?: (error: Error) => void;
}

export interface UseCreateSectorReturn {
  mutate: (predioId: number, data: CreateSectorDto) => void;
  mutateAsync: (predioId: number, data: CreateSectorDto) => Promise<Sector>;
  isLoading: boolean;
  error: Error | null;
}

export function useCreateSector(
  options: UseCreateSectorOptions = {},
): UseCreateSectorReturn {
  const { onSuccess, onError } = options;

  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ predioId, data }: { predioId: number; data: CreateSectorDto }) =>
      prediosService.createSector(predioId, data),

    onMutate: async ({ predioId: pId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.predios.sectores(pId) });

      // Snapshot previous value
      const previousSectores =
        queryClient.getQueryData<Sector[]>(queryKeys.predios.sectores(pId));

      return { previousSectores };
    },

    onError: (err, _variables, context) => {
      // Rollback to previous value
      if (context?.previousSectores) {
        queryClient.setQueryData(
          queryKeys.predios.sectores(0),
          context.previousSectores,
        );
      }

      onError?.(err as Error);
    },

    onSuccess: (newSector) => {
      // Invalidate sectores list for this Predio
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.sectores(newSector.predioId),
      });

      onSuccess?.(newSector);
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.predios.sectores(variables.predioId),
      });
    },
  });

  const wrappedMutate = (predioId: number, data: CreateSectorDto) => {
    mutate({ predioId: predioId, data });
  };

  const wrappedMutateAsync = async (predioId: number, data: CreateSectorDto): Promise<Sector> => {
    return mutateAsync({ predioId: predioId, data });
  };

  return {
    mutate: wrappedMutate,
    mutateAsync: wrappedMutateAsync,
    isLoading: isPending,
    error: error as Error | null,
  };
}
