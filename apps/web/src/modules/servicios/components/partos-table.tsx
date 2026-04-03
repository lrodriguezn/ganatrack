// apps/web/src/modules/servicios/components/partos-table.tsx
/**
 * PartosTable — displays parto records with pagination.
 *
 * Columns: animal, fecha, machos, hembras, muertos, tipo, acciones
 */

'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Parto, PaginatedEventos } from '../types/servicios.types';
import { DataTable } from '@/shared/components/ui/data-table';

const tipoPartoBadge = (tipo: string): string => {
  switch (tipo) {
    case 'Normal':
      return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300';
    case 'Con Ayuda':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300';
    case 'Distocico':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300';
    case 'Mortinato':
      return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300';
  }
};

interface PartosTableProps {
  data: PaginatedEventos<Parto> | undefined;
  isLoading?: boolean;
  page: number;
  limit: number;
  onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void;
}

export function PartosTable({
  data,
  isLoading = false,
  page,
  limit,
  onPaginationChange,
}: PartosTableProps): JSX.Element {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('es-CO');
  };

  const columns: ColumnDef<Parto>[] = useMemo(() => [
    {
      id: 'animal',
      accessorKey: 'animalCodigo',
      header: 'Animal',
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {row.original.animalCodigo ?? '-'}
          </span>
          {row.original.animalNombre && (
            <span className="ml-2 text-gray-500 dark:text-gray-400">
              {row.original.animalNombre}
            </span>
          )}
        </div>
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
      id: 'machos',
      accessorKey: 'machos',
      header: 'Machos',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">{row.original.machos}</span>
      ),
    },
    {
      id: 'hembras',
      accessorKey: 'hembras',
      header: 'Hembras',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">{row.original.hembras}</span>
      ),
    },
    {
      id: 'muertos',
      accessorKey: 'muertos',
      header: 'Muertos',
      cell: ({ row }) => (
        <span className={row.original.muertos > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}>
          {row.original.muertos}
        </span>
      ),
    },
    {
      id: 'tipoParto',
      accessorKey: 'tipoParto',
      header: 'Tipo',
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tipoPartoBadge(row.original.tipoParto)}`}
        >
          {row.original.tipoParto}
        </span>
      ),
    },
  ], []);

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
          <p className="text-gray-500 dark:text-gray-400">No hay partos registrados</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Registra tu primer parto para comenzar
          </p>
        </div>
      }
    />
  );
}
