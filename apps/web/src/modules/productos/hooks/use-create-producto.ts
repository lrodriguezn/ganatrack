// apps/web/src/modules/productos/hooks/use-create-producto.ts
/**
 * useCreateProducto — mutation hook for creating a product.
 *
 * @example
 * const { mutateAsync: createProducto, isPending } = useCreateProducto();
 * await createProducto(data);
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productoService } from '../services';
import { queryKeys } from '@/shared/lib/query-keys';
import type { CreateProductoDto } from '../types/producto.types';

export function useCreateProducto() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateProductoDto) => productoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productos.all });
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
}
