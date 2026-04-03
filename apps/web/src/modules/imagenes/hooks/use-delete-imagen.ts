// apps/web/src/modules/imagenes/hooks/use-delete-imagen.ts
/**
 * useDeleteImagen — mutation hook for deleting an image.
 *
 * On success, invalidates the image list for the entity and removes
 * the detail query from cache.
 *
 * @example
 * const { mutateAsync: deleteImagen, isPending } = useDeleteImagen();
 * await deleteImagen({ id: 456, entidadTipo: 'producto', entidadId: 123 });
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { imagenService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { EntidadTipo } from '../types/imagen.types';

interface DeleteImagenParams {
  id: number;
  entidadTipo: EntidadTipo;
  entidadId: number;
}

export function useDeleteImagen() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id }: DeleteImagenParams) => imagenService.delete(id),
    onSuccess: (_data, { id, entidadTipo, entidadId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.imagenes.byEntity(entidadTipo, entidadId),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.imagenes.detail(id),
      });
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
}
