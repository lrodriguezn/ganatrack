// apps/web/src/modules/servicios/components/servicios-veterinarios-table.tsx
/**
 * ServiciosVeterinariosTable — displays veterinary service events with pagination.
 *
 * Columns: código, fecha, veterinario, # animales, próxima aplicación pendiente, acciones
 * Row click navigates to event detail.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { ServicioVeterinarioEvento, PaginationParams, PaginatedEventos } from '../types/servicios.types';
import { DataTable } from '@/shared/components/ui/data-table';

interface ServiciosVeterinariosTableProps {
  data: PaginatedEventos<ServicioVeterinarioEvento> | undefined;
  isLoading?: boolean;
  page: number;
  limit: number;
  onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void;
}

export function ServiciosVeterinariosTable({
  data,
  isLoading = false,
  page,
  limit,
  onPaginationChange,
}: ServiciosVeterinariosTableProps): JSX.Element {
  const router = useRouter();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('es-CO');
  };

  /**
   * Find the earliest proximaAplicacion across all animals in the event
   * that is still pending (in the future or today).
   */
  const getEarliestPendingAplicacion = (evento: ServicioVeterinarioEvento): string | null => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const pendingDates = evento.animales
      .map((a) => a.proximaAplicacion)
      .filter((d): d is string => !!d)
      .map((d) => new Date(d))
      .filter((d) => d >= now);

    if (pendingDates.length === 0) return null;

    const earliest = pendingDates.reduce((a, b) => (a < b ? a : b));
    return earliest.toISOString();
  };

  const columns: ColumnDef<ServicioVeterinarioEvento>[] = useMemo(() => [
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
      id: 'proximaAplicacion',
      header: 'Próxima Aplicación Pendiente',
      cell: ({ row }) => {
        const earliest = getEarliestPendingAplicacion(row.original);
        return (
          <span className={`text-sm ${earliest ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
            {earliest ? formatDate(earliest) : '—'}
          </span>
        );
      },
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/servicios/veterinarios/${row.original.id}`);
            }}
            className="
              inline-flex items-center justify-center gap-1.5
              rounded-md px-2.5 py-1.5 text-sm font-medium
              text-blue-600 hover:bg-blue-50
              dark:text-blue-400 dark:hover:bg-blue-500/10
              transition-colors
            "
          >
            Ver
          </button>
        </div>
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
          <p className="text-gray-500 dark:text-gray-400">No hay servicios veterinarios registrados</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            Crea tu primer servicio veterinario para comenzar
          </p>
        </div>
      }
    />
  );
}
