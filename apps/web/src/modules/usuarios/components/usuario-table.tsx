// apps/web/src/modules/usuarios/components/usuario-table.tsx
/**
 * UsuarioTable — displays usuarios with pagination, search, status badges,
 * activate/deactivate actions, and <Can> permission guards.
 *
 * Columns: nombre, email, rol, predio, estado, último acceso, acciones
 *
 * Usage:
 *   <UsuarioTable
 *     usuarios={data?.data ?? []}
 *     isLoading={isLoading}
 *     pageIndex={page}
 *     pageSize={limit}
 *     totalRows={data?.total ?? 0}
 *     pageCount={data?.totalPages ?? 1}
 *     onPaginationChange={handlePaginationChange}
 *     onDeactivate={handleDeactivate}
 *     onActivate={handleActivate}
 *   />
 */

'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import type { Usuario } from '../types/usuarios.types';
import { DataTable } from '@/shared/components/ui/data-table';
import { Can } from '@/modules/auth/components/can';

// Estado badge color
const estadoBadgeColor = (activo: boolean): string => {
  return activo
    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
    : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300';
};

const estadoLabel = (activo: boolean): string => {
  return activo ? 'Activo' : 'Inactivo';
};

interface UsuarioTableProps {
  usuarios: Usuario[];
  isLoading?: boolean;
  pageIndex: number;
  pageSize: number;
  totalRows: number;
  pageCount: number;
  onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void;
  onDeactivate?: (usuario: Usuario) => void;
  onActivate?: (usuario: Usuario) => void;
}

export function UsuarioTable({
  usuarios,
  isLoading = false,
  pageIndex,
  pageSize,
  totalRows,
  pageCount,
  onPaginationChange,
  onDeactivate,
  onActivate,
}: UsuarioTableProps): JSX.Element {
  const router = useRouter();

  const columns: ColumnDef<Usuario>[] = useMemo(() => [
    {
      id: 'nombre',
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.original.nombre}
        </span>
      ),
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.email}
        </span>
      ),
    },
    {
      id: 'rol',
      accessorKey: 'rolNombre',
      header: 'Rol',
      cell: ({ row }) => (
        <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
          {row.original.rolNombre ?? '-'}
        </span>
      ),
    },
    {
      id: 'predio',
      accessorKey: 'predioNombre',
      header: 'Predio',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.predioNombre ?? '-'}
        </span>
      ),
    },
    {
      id: 'estado',
      accessorKey: 'activo',
      header: 'Estado',
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoBadgeColor(row.original.activo)}`}
        >
          {estadoLabel(row.original.activo)}
        </span>
      ),
    },
    {
      id: 'ultimoAcceso',
      header: 'Último acceso',
      cell: ({ row }) => {
        const lastLogin = row.original.lastLoginAt;
        if (!lastLogin) {
          return <span className="text-gray-400 dark:text-gray-500">Nunca</span>;
        }
        const date = new Date(lastLogin);
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {date.toLocaleDateString('es-CO')}
          </span>
        );
      },
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
              router.push(`/dashboard/usuarios/${row.original.id}`);
            }}
            className="
              inline-flex items-center justify-center gap-1.5
              rounded-md px-2.5 py-1.5 text-sm font-medium
              text-gray-600 hover:bg-gray-50
              dark:text-gray-400 dark:hover:bg-gray-500/10
              transition-colors
            "
            aria-label={`Ver detalles de ${row.original.nombre}`}
          >
            Ver
          </button>

          <Can permission="usuarios:write">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/usuarios/${row.original.id}/editar`);
              }}
              className="
                inline-flex items-center justify-center gap-1.5
                rounded-md px-2.5 py-1.5 text-sm font-medium
                text-blue-600 hover:bg-blue-50
                dark:text-blue-400 dark:hover:bg-blue-500/10
                transition-colors
              "
              aria-label={`Editar ${row.original.nombre}`}
            >
              Editar
            </button>
          </Can>

          {row.original.activo ? (
            <Can permission="usuarios:delete">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeactivate?.(row.original);
                }}
                className="
                  inline-flex items-center justify-center gap-1.5
                  rounded-md px-2.5 py-1.5 text-sm font-medium
                  text-red-600 hover:bg-red-50
                  dark:text-red-400 dark:hover:bg-red-500/10
                  transition-colors
                "
                aria-label={`Desactivar ${row.original.nombre}`}
              >
                Desactivar
              </button>
            </Can>
          ) : (
            <Can permission="usuarios:write">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onActivate?.(row.original);
                }}
                className="
                  inline-flex items-center justify-center gap-1.5
                  rounded-md px-2.5 py-1.5 text-sm font-medium
                  text-green-600 hover:bg-green-50
                  dark:text-green-400 dark:hover:bg-green-500/10
                  transition-colors
                "
                aria-label={`Activar ${row.original.nombre}`}
              >
                Activar
              </button>
            </Can>
          )}
        </div>
      ),
    },
  ], [router, onDeactivate, onActivate]);

  return (
    <DataTable
      columns={columns}
      data={usuarios}
      pageCount={pageCount}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalRows={totalRows}
      onPaginationChange={onPaginationChange}
      isLoading={isLoading}
      emptyState={
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No hay usuarios registrados</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Crea tu primer usuario para comenzar
          </p>
        </div>
      }
    />
  );
}
