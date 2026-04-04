// apps/web/src/modules/productos/components/producto-table.tsx
/**
 * ProductoTable — displays products with pagination, sorting, and actions.
 *
 * Columns: nombre, tipo, unidad, stock, precio, estado, acciones
 * Row click navigates to detail page.
 *
 * Usage:
 *   <ProductoTable
 *     productos={data?.data ?? []}
 *     isLoading={isLoading}
 *     pageIndex={page}
 *     pageSize={limit}
 *     totalRows={data?.total ?? 0}
 *     pageCount={data?.totalPages ?? 1}
 *     onPaginationChange={handlePaginationChange}
 *     onDelete={handleDelete}
 *   />
 */

'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/shared/components/ui/data-table';
import type { Producto } from '../types/producto.types';

// Tipo label helper
const tipoLabel = (key: number): string => {
  switch (key) {
    case 1: return 'Medicamento';
    case 2: return 'Suplemento';
    case 3: return 'Insumo';
    default: return 'Desconocido';
  }
};

// Tipo badge color
const tipoBadgeColor = (key: number): string => {
  switch (key) {
    case 1: return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300';
    case 2: return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300';
    case 3: return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300';
  }
};

// Estado badge color
const estadoBadgeColor = (key: number): string => {
  switch (key) {
    case 1: return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300';
    case 2: return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300';
  }
};

// Stock indicator
const stockIndicator = (stock: number, minimo?: number): { color: string; text: string } => {
  const threshold = minimo ?? 5;
  if (stock === 0) return { color: 'text-red-600 dark:text-red-400 font-semibold', text: 'Agotado' };
  if (stock < threshold) return { color: 'text-amber-600 dark:text-amber-400 font-medium', text: 'Stock bajo' };
  return { color: 'text-gray-900 dark:text-gray-100', text: String(stock) };
};

interface ProductoTableProps {
  productos: Producto[];
  isLoading?: boolean;
  pageIndex: number;
  pageSize: number;
  totalRows: number;
  pageCount: number;
  onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void;
  onDelete?: (producto: Producto) => void;
}

export function ProductoTable({
  productos,
  isLoading = false,
  pageIndex,
  pageSize,
  totalRows,
  pageCount,
  onPaginationChange,
  onDelete,
}: ProductoTableProps): JSX.Element {
  const router = useRouter();

  const columns: ColumnDef<Producto>[] = useMemo(() => [
    {
      id: 'nombre',
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {row.original.nombre}
          </span>
          {row.original.descripcion && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
              {row.original.descripcion}
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'tipo',
      accessorKey: 'tipoKey',
      header: 'Tipo',
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tipoBadgeColor(row.original.tipoKey)}`}
        >
          {tipoLabel(row.original.tipoKey)}
        </span>
      ),
    },
    {
      id: 'unidadMedida',
      accessorKey: 'unidadMedida',
      header: 'Unidad',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300 capitalize">
          {row.original.unidadMedida}
        </span>
      ),
    },
    {
      id: 'stock',
      accessorKey: 'stockActual',
      header: 'Stock',
      cell: ({ row }) => {
        const indicator = stockIndicator(row.original.stockActual, row.original.stockMinimo);
        return (
          <span className={indicator.color}>
            {indicator.text}
            {indicator.text === 'Stock bajo' && (
              <span className="ml-1 text-xs">({row.original.stockMinimo} mín)</span>
            )}
          </span>
        );
      },
    },
    {
      id: 'precio',
      accessorKey: 'precioUnitario',
      header: 'Precio',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.precioUnitario
            ? `$${row.original.precioUnitario.toLocaleString('es-CO')}`
            : '-'}
        </span>
      ),
    },
    {
      id: 'estado',
      accessorKey: 'estadoKey',
      header: 'Estado',
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoBadgeColor(row.original.estadoKey)}`}
        >
          {row.original.estadoKey === 1 ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/maestros/productos/${row.original.id}`);
            }}
            className="inline-flex items-center rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5 transition-colors"
            aria-label="Ver detalle"
          >
            Ver
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/maestros/productos/${row.original.id}/editar`);
            }}
            className="inline-flex items-center rounded-md px-2.5 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 transition-colors"
            aria-label="Editar"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(row.original);
            }}
            className="inline-flex items-center rounded-md px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
            aria-label="Eliminar"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ], [router, onDelete]);

  return (
    <DataTable
      columns={columns}
      data={productos}
      pageCount={pageCount}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalRows={totalRows}
      onPaginationChange={onPaginationChange}
      isLoading={isLoading}
      emptyState={
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No hay productos registrados</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Crea tu primer producto para comenzar
          </p>
        </div>
      }
    />
  );
}
