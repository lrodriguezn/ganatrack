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

  const queryKey = queryKeys.maestros.byTipo(tipo, { page, limit, search });

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => maestrosService.getAll(tipo, { page, limit, search }),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // ============================================================================
  // Shared invalidation — invalidates all queries for this tipo
  // ============================================================================

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.maestros.byTipo(tipo) });

  // ============================================================================
  // Mutation — create
  // ============================================================================

  const createMutation = useMutation({
    mutationFn: (newData: CreateMaestroDto) => maestrosService.create(tipo, newData),
    onSuccess: invalidate,
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
    onSuccess: invalidate,
  });

  // ============================================================================
  // Mutation — remove
  // ============================================================================

  const removeMutation = useMutation({
    mutationFn: (id: number) => maestrosService.remove(tipo, id),
    onSuccess: invalidate,
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
    page,
    limit,
    total: data?.meta?.total ?? 0,
    search,
    setPage,
    setLimit,
    setSearch,
  };
}
