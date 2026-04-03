// apps/web/src/app/dashboard/productos/nuevo/page.tsx
/**
 * Nuevo Producto page — create form.
 *
 * Route: /dashboard/productos/nuevo
 */

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProductoForm } from '@/modules/productos/components/producto-form';
import { Button } from '@/shared/components/ui/button';
import { useCreateProducto } from '@/modules/productos/hooks';
import { usePredioStore } from '@/store/predio.store';
import type { CreateProductoDto } from '@/modules/productos/types/producto.types';

export default function NuevoProductoPage(): JSX.Element {
  const router = useRouter();
  const { predioActivo } = usePredioStore();
  const { mutateAsync, isPending, error } = useCreateProducto();

  const handleSubmit = async (data: CreateProductoDto) => {
    await mutateAsync({
      ...data,
      predioId: predioActivo?.id ?? 0,
    });
    router.push('/dashboard/productos');
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/productos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Nuevo Producto
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Registra un nuevo producto veterinario
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al crear el producto: {(error as Error).message}
          </p>
        </div>
      )}

      {/* Form */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <ProductoForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dashboard/productos')}
          isLoading={isPending}
        />
      </div>
    </div>
  );
}
