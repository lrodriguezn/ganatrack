// apps/web/src/modules/productos/hooks/use-delete-producto.ts
/**
 * useDeleteProducto — mutation hook for deleting a product.
 *
 * @example
 * const { mutateAsync: deleteProducto, isPending } = useDeleteProducto();
 * await deleteProducto(id);
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productoService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import { queryClient as globalQueryClient } from '@/shared/lib/query-client';

export function useDeleteProducto() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: number) => productoService.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.all });
      // Also invalidate imagenes for this product
      queryClient.invalidateQueries({ queryKey: queryKeys.imagenes.byEntity('producto', id) });
      // Remove detail query
      queryClient.removeQueries({ queryKey: queryKeys.productos.detail(id) });
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
}

/**
 * Imperative delete for use outside React components (e.g., from stores).
 */
export async function deleteProductoImperative(id: number): Promise<void> {
  await productoService.delete(id);
  globalQueryClient.invalidateQueries({ queryKey: queryKeys.productos.all });
  globalQueryClient.invalidateQueries({ queryKey: queryKeys.imagenes.byEntity('producto', id) });
  globalQueryClient.removeQueries({ queryKey: queryKeys.productos.detail(id) });
}
