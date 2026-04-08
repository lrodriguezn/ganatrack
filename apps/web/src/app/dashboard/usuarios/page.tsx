// apps/web/src/app/dashboard/usuarios/page.tsx
/**
 * Usuarios list page — main listing with search, filters, and table.
 *
 * Features:
 * - Search bar for nombre/email
 * - Filters: rol, estado (activo/inactivo)
 * - UsuarioTable with server-side pagination
 * - "Nuevo Usuario" button with <Can> guard
 * - Row click → /dashboard/usuarios/:id
 *
 * Route: /dashboard/usuarios
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { usePredioStore } from '@/store/predio.store';
import { usuariosService } from '@/modules/usuarios/services';
import { UsuarioTable } from '@/modules/usuarios/components/usuario-table';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Can } from '@/modules/auth/components/can';
import type { Usuario } from '@/modules/usuarios/types/usuarios.types';
import { useRoles } from '@/modules/usuarios/hooks/use-roles';

export default function UsuariosListPage(): JSX.Element {
  const router = useRouter();
  const { predioActivo } = usePredioStore();
  const { data: roles } = useRoles();

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filters state
  const [search, setSearch] = useState('');
  const [rolId, setRolId] = useState<number | undefined>(undefined);
  const [activo, setActivo] = useState<boolean | undefined>(undefined);

  // Data state
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load usuarios
  const loadUsuarios = useCallback(async () => {
    if (!predioActivo?.id) return;

    try {
      setIsLoading(true);
      const result = await usuariosService.getAll({
        predioId: predioActivo.id,
        page: pageIndex + 1,
        limit: pageSize,
        search: search || undefined,
        rolId,
        activo,
      });
      setUsuarios(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [predioActivo?.id, pageIndex, pageSize, search, rolId, activo]);

  useEffect(() => {
    loadUsuarios();
  }, [loadUsuarios]);

  // Handlers
  const handlePaginationChange = (pagination: { pageIndex: number; pageSize: number }) => {
    setPageIndex(pagination.pageIndex);
    setPageSize(pagination.pageSize);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0);
  };

  const handleDeactivate = async (usuario: Usuario) => {
    try {
      await usuariosService.deactivate(usuario.id);
      loadUsuarios();
    } catch (err) {
      console.error('Error desactivando usuario:', err);
    }
  };

  const handleActivate = async (usuario: Usuario) => {
    try {
      await usuariosService.activate(usuario.id);
      loadUsuarios();
    } catch (err) {
      console.error('Error activando usuario:', err);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12" role="alert">
        <p className="text-gray-500 dark:text-gray-400">
          Error al cargar los usuarios
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Usuarios
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestiona los usuarios y permisos de tu predio
          </p>
        </div>
        <Can permission="usuarios:write">
          <Link href="/dashboard/usuarios/nuevo">
            <Button aria-label="Crear nuevo usuario">
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              Nuevo Usuario
            </Button>
          </Link>
        </Can>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            value={search}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e: any) => handleSearchChange(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="flex w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 pl-10 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 px-4 py-2"
            aria-label="Buscar usuarios"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Rol filter */}
          <select
            value={rolId ?? ''}
            onChange={(e) => {
              setRolId(e.target.value ? Number(e.target.value) : undefined);
              setPageIndex(0);
            }}
            className="h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            aria-label="Filtrar por rol"
          >
            <option value="">Todos los roles</option>
            {roles?.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre}
              </option>
            ))}
          </select>

          {/* Estado filter */}
          <select
            value={activo === undefined ? '' : activo ? 'true' : 'false'}
            onChange={(e) => {
              setActivo(e.target.value === '' ? undefined : e.target.value === 'true');
              setPageIndex(0);
            }}
            className="h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <UsuarioTable
          usuarios={usuarios}
          isLoading={isLoading}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalRows={total}
          pageCount={totalPages}
          onPaginationChange={handlePaginationChange}
          onDeactivate={handleDeactivate}
          onActivate={handleActivate}
        />
      )}
    </div>
  );
}
