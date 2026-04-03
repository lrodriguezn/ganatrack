// apps/web/src/modules/maestros/hooks/use-maestro.ts
/**
 * useMaestro — generic hook for any maestro entity.
 *
 * Provides:
 * - items: MaestroBase[] — list of all items of the given tipo
 * - isLoading / error — query state
 * - create / update / remove — mutations with cache invalidation
 * - isCreating / isUpdating / isRemoving — mutation loading states
 *
 * Usage:
 *   const { items, create, update, remove, isLoading } = useMaestro('veterinarios');
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maestrosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';
import type { CreateMaestroDto, MaestroTipo, MaestroBase } from '../types/maestro.types';

export function useMaestro(tipo: MaestroTipo) {
  const queryClient = useQueryClient();

  // ============================================================================
  // Query — list all items for this tipo
  // ============================================================================

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.maestros.byTipo(tipo),
    queryFn: () => maestrosService.getAll(tipo),
    staleTime: StaleTimes.LIST,
  });

  // ============================================================================
  // Mutation — create
  // ============================================================================

  const createMutation = useMutation({
    mutationFn: (newData: CreateMaestroDto) =>
      maestrosService.create(tipo, newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maestros.byTipo(tipo) });
    },
  });

  // ============================================================================
  // Mutation — update
  // ============================================================================

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data: updateData,
    }: {
      id: number;
      data: Partial<CreateMaestroDto>;
    }) => maestrosService.update(tipo, id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maestros.byTipo(tipo) });
    },
  });

  // ============================================================================
  // Mutation — remove
  // ============================================================================

  const removeMutation = useMutation({
    mutationFn: (id: number) => maestrosService.remove(tipo, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maestros.byTipo(tipo) });
    },
  });

  return {
    items: data ?? [],
    isLoading,
    error: error as Error | null,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
