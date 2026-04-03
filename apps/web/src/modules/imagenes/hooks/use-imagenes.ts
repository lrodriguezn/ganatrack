// apps/web/src/modules/imagenes/hooks/use-imagenes.ts
/**
 * useImagenes — list images by entity (producto/animal).
 *
 * @example
 * const { data, isLoading, error } = useImagenes({
 *   entidadTipo: 'producto',
 *   entidadId: 123,
 * });
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { imagenService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { StaleTimes } from '@/shared/lib/query-client';
import type { ImagenFilters } from '../types/imagen.types';

export function useImagenes(filters: ImagenFilters) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.imagenes.byEntity(filters.entidadTipo, filters.entidadId),
    queryFn: () => imagenService.listByEntity(filters),
    staleTime: StaleTimes.LIST,
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
