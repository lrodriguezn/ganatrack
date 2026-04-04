// apps/web/src/app/dashboard/maestros/productos/[id]/page.tsx
/**
 * Producto detail page — shows full product info with inline image gallery.
 *
 * Route: /dashboard/maestros/productos/:id
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { usePredioStore } from '@/store/predio.store';
import { useImagenes } from '@/modules/imagenes/hooks/use-imagenes';
import { ProductoDetail } from '@/modules/productos/components/producto-detail';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { productoService } from '@/modules/productos/services';
import type { Producto } from '@/modules/productos/types/producto.types';

export default function ProductoDetailPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const { predioActivo } = usePredioStore();
  const id = Number(params.id);

  const [producto, setProducto] = useState<Producto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load images for this product
  const { data: imagenes, isLoading: isLoadingImages } = useImagenes({
    entidadTipo: 'producto',
    entidadId: id,
  });

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

  const handleDelete = async (productoId: number) => {
    try {
      setIsDeleting(true);
      await productoService.delete(productoId);
      router.push('/dashboard/maestros/productos');
    } catch (err) {
      console.error('Error deleting producto:', err);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Producto no encontrado
        </p>
        <Link href="/dashboard/maestros/productos">
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
      {/* Back navigation */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/maestros/productos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </Link>
      </div>

      {/* Detail view */}
      <ProductoDetail
        producto={producto}
        imagenes={imagenes}
        isLoadingImages={isLoadingImages}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
