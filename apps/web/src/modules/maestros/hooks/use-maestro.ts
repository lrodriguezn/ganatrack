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

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maestrosService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';
import type { CreateMaestroDto, MaestroTipo, MaestroBase } from '../types/maestro.types';

export interface UseMaestroPagination {
  page: number;
  limit: number;
  search: string;
  setPage: (p: number) => void;
  setLimit: (l: number) => void;
  setSearch: (s: string) => void;
}

export function useMaestro(
  tipo: MaestroTipo,
  pagination?: { page?: number; limit?: number; search?: string },
) {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(pagination?.page ?? 1);
  const [limit, setLimit] = useState(pagination?.limit ?? 20);
  const [search, setSearch] = useState(pagination?.search ?? '');

  // ============================================================================
  // Query — list all items for this tipo
  // ============================================================================

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.maestros.byTipo(tipo, { page, limit, search }),
    queryFn: () => maestrosService.getAll(tipo, { page, limit, search }),
    staleTime: StaleTimes.LIST,
  });

  // ============================================================================
  // Mutation — create
  // ============================================================================

  const createMutation = useMutation({
    mutationFn: (newData: CreateMaestroDto) => {
      return maestrosService.create(tipo, newData);
    },
    onSuccess: () => {
      console.log('[useMaestro] create onSuccess - invalidating cache for:', tipo);
      queryClient.invalidateQueries({ queryKey: queryKeys.maestros.byTipo(tipo) });
      queryClient.refetchQueries({ queryKey: queryKeys.maestros.byTipo(tipo) });
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
      queryClient.refetchQueries({ queryKey: queryKeys.maestros.byTipo(tipo) });
    },
  });

  // ============================================================================
  // Mutation — remove
  // ============================================================================

  const removeMutation = useMutation({
    mutationFn: (id: number) => maestrosService.remove(tipo, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maestros.byTipo(tipo) });
      queryClient.refetchQueries({ queryKey: queryKeys.maestros.byTipo(tipo) });
    },
  });

  return {
    items: data?.data ?? [],
    isLoading,
    error: error as Error | null,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
    // Pagination
    page,
    limit,
    total: data?.meta?.total ?? 0,
    search,
    setPage,
    setLimit,
    setSearch,
  };
}
