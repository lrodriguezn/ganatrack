// apps/web/src/modules/configuracion/hooks/use-catalogo.ts
/**
 * useCatalogo — generic hook for any catalog entity.
 *
 * Provides:
 * - items: CatalogoBase[] — list of all items of the given tipo
 * - isLoading / error — query state
 * - create / update / remove — mutations with cache invalidation
 * - isCreating / isUpdating / isRemoving — mutation loading states
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogoService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';
import type { CreateCatalogoDto, CatalogoTipo, CatalogoBase } from '../types/catalogo.types';

export function useCatalogo(tipo: CatalogoTipo) {
  const queryClient = useQueryClient();

  // ============================================================================
  // Query — list all items for this tipo
  // ============================================================================

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.configuracion.byTipo(tipo),
    queryFn: () => catalogoService.getAll(tipo),
    staleTime: StaleTimes.LIST,
  });

  // ============================================================================
  // Mutation — create
  // ============================================================================

  const createMutation = useMutation({
    mutationFn: (newData: CreateCatalogoDto) =>
      catalogoService.create(tipo, newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.configuracion.byTipo(tipo) });
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
      data: Partial<CreateCatalogoDto>;
    }) => catalogoService.update(tipo, id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.configuracion.byTipo(tipo) });
    },
  });

  // ============================================================================
  // Mutation — remove
  // ============================================================================

  const removeMutation = useMutation({
    mutationFn: (id: number) => catalogoService.remove(tipo, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.configuracion.byTipo(tipo) });
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
