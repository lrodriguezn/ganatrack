// apps/web/src/modules/productos/hooks/use-update-producto.ts
/**
 * useUpdateProducto — mutation hook for updating a product.
 *
 * @example
 * const { mutateAsync: updateProducto, isPending } = useUpdateProducto();
 * await updateProducto({ id: 123, data });
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productoService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { UpdateProductoDto } from '../types/producto.types';

export function useUpdateProducto() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductoDto }) =>
      productoService.update(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.detail(id) });
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
}
