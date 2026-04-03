// apps/web/src/app/dashboard/productos/[id]/editar/page.tsx
/**
 * Editar Producto page — edit form for existing product.
 *
 * Route: /dashboard/productos/:id/editar
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProductoForm } from '@/modules/productos/components/producto-form';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useUpdateProducto } from '@/modules/productos/hooks';
import { productoService } from '@/modules/productos/services';
import type { Producto, UpdateProductoDto } from '@/modules/productos/types/producto.types';

export default function EditarProductoPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [producto, setProducto] = useState<Producto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { mutateAsync, isPending, error: mutationError } = useUpdateProducto();
  const [submitError, setSubmitError] = useState<Error | null>(null);

  // Load product
  useEffect(() => {
    async function loadProducto() {
      if (!id || id <= 0) return;

      try {
        setIsLoading(true);
        const data = await productoService.getById(id);
        setProducto(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducto();
  }, [id]);

  const handleSubmit = async (data: UpdateProductoDto) => {
    setSubmitError(null);
    try {
      await mutateAsync({ id, data });
      router.push(`/dashboard/productos/${id}`);
    } catch (err) {
      setSubmitError(err as Error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Producto no encontrado
        </p>
        <Link href="/dashboard/productos">
          <Button className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver al listado
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/productos/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Editar Producto
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {producto.nombre}
          </p>
        </div>
      </div>

      {/* Error messages */}
      {(error || mutationError || submitError) && (
        <div className="rounded-md bg-red-50 dark:bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al actualizar el producto: {((error || mutationError || submitError) as Error).message}
          </p>
        </div>
      )}

      {/* Form */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <ProductoForm
          initialData={producto}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/dashboard/productos/${id}`)}
          isLoading={isPending}
        />
      </div>
    </div>
  );
}
