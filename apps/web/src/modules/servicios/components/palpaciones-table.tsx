// apps/web/src/modules/servicios/components/palpaciones-table.tsx
/**
 * PalpacionesTable — displays palpación events with pagination.
 *
 * Columns: código, fecha, veterinario, # animales, acciones
 * Row click navigates to event detail.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { PalpacionEvento, PaginationParams, PaginatedEventos } from '../types/servicios.types';
import { DataTable } from '@/shared/components/ui/data-table';

interface PalpacionesTableProps {
  data: PaginatedEventos<PalpacionEvento> | undefined;
  isLoading?: boolean;
  page: number;
  limit: number;
  onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void;
}

export function PalpacionesTable({
  data,
  isLoading = false,
  page,
  limit,
  onPaginationChange,
}: PalpacionesTableProps): JSX.Element {
  const router = useRouter();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('es-CO');
  };

  const columns: ColumnDef<PalpacionEvento>[] = useMemo(() => [
    {
      id: 'codigo',
      accessorKey: 'codigo',
      header: 'Código',
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.original.codigo}
        </span>
      ),
    },
    {
      id: 'fecha',
      accessorKey: 'fecha',
      header: 'Fecha',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {formatDate(row.original.fecha)}
        </span>
      ),
    },
    {
      id: 'veterinario',
      accessorKey: 'veterinarioNombre',
      header: 'Veterinario',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.veterinarioNombre ?? '-'}
        </span>
      ),
    },
    {
      id: 'totalAnimales',
      accessorKey: 'totalAnimales',
      header: '# Animales',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.totalAnimales ?? 0}
        </span>
      ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/servicios/palpaciones/${row.original.id}`);
          }}
          className="
            inline-flex items-center justify-center gap-1.5
            rounded-md px-2.5 py-1.5 text-sm font-medium
            text-blue-600 hover:bg-blue-50
            dark:text-blue-400 dark:hover:bg-blue-500/10
            transition-colors
          "
        >
          Ver detalle
        </button>
      ),
    },
  ], [router]);

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      pageCount={data?.totalPages ?? 1}
      pageIndex={page}
      pageSize={limit}
      totalRows={data?.total ?? 0}
      onPaginationChange={onPaginationChange}
      isLoading={isLoading}
      emptyState={
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No hay palpaciones registradas</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Crea tu primera palpación para comenzar
          </p>
        </div>
      }
    />
  );
}
