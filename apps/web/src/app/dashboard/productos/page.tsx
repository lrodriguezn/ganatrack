// apps/web/src/app/dashboard/productos/page.tsx
/**
 * Productos list page — main listing with search, filters, and table.
 *
 * Features:
 * - Search bar with debounce
 * - Filters: tipo, estado
 * - ProductoTable with server-side pagination
 * - "Nuevo Producto" button → /dashboard/productos/nuevo
 * - Row click → /dashboard/productos/:id
 *
 * Route: /dashboard/productos
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { usePredioStore } from '@/store/predio.store';
import { productoService } from '@/modules/productos/services';
import { ProductoTable } from '@/modules/productos/components/producto-table';
import { ProductoFilters } from '@/modules/productos/components/producto-filters';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Modal } from '@/shared/components/ui/modal';
import type { Producto } from '@/modules/productos/types/producto.types';

export default function ProductosListPage(): JSX.Element {
  const router = useRouter();
  const { predioActivo } = usePredioStore();

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filters state
  const [search, setSearch] = useState('');
  const [tipoKey, setTipoKey] = useState<number | undefined>(undefined);
  const [estadoKey, setEstadoKey] = useState<number | undefined>(undefined);

  // Data state
  const [productos, setProductos] = useState<Producto[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Producto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load productos
  const loadProductos = useCallback(async () => {
    if (!predioActivo?.id) return;

    try {
      setIsLoading(true);
      const result = await productoService.getAll({
        predioId: predioActivo.id,
        page: pageIndex + 1,
        limit: pageSize,
        search: search || undefined,
        tipoKey,
        estadoKey,
      });
      setProductos(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [predioActivo?.id, pageIndex, pageSize, search, tipoKey, estadoKey]);

  useEffect(() => {
    loadProductos();
  }, [loadProductos]);

  // Handlers
  const handlePaginationChange = (pagination: { pageIndex: number; pageSize: number }) => {
    setPageIndex(pagination.pageIndex);
    setPageSize(pagination.pageSize);
  };

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPageIndex(0);
  }, []);

  const handleFilterChange = useCallback((type: 'tipo' | 'estado', value: number | undefined) => {
    if (type === 'tipo') {
      setTipoKey(value);
    } else {
      setEstadoKey(value);
    }
    setPageIndex(0);
  }, []);

  const handleDelete = async (id: number) => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      await productoService.delete(id);
      setDeleteTarget(null);
      loadProductos();
    } catch (err) {
      console.error('Error deleting producto:', err);
      // Keep modal open on error so user can see the failure
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No se pudieron cargar los productos
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          {error.message}
        </p>
        <Button onClick={() => { setError(null); loadProductos(); }} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Productos
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestiona el inventario de productos veterinarios de tu predio
          </p>
        </div>
        <Link href="/dashboard/productos/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <ProductoFilters
        onSearch={handleSearch}
        onTipoChange={(key) => handleFilterChange('tipo', key)}
        onEstadoChange={(key) => handleFilterChange('estado', key)}
        tipoKey={tipoKey}
        estadoKey={estadoKey}
      />

      {/* Table */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <ProductoTable
          productos={productos}
          isLoading={isLoading}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalRows={total}
          pageCount={totalPages}
          onPaginationChange={handlePaginationChange}
          onDelete={(producto) => setDeleteTarget(producto)}
        />
      )}

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar producto"
        description={`¿Está seguro que desea eliminar "${deleteTarget?.nombre ?? ''}"? Esta acción no se puede deshacer.`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
              isLoading={isDeleting}
            >
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Todas las imágenes asociadas también serán eliminadas.
        </p>
      </Modal>
    </div>
  );
}
