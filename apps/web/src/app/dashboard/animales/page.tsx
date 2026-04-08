// apps/web/src/app/dashboard/animales/page.tsx
/**
 * Animales list page — main listing with KPI cards, search, filters, and table.
 *
 * Features:
 * - KPI cards: total activos, machos, hembras (from estadisticas)
 * - Search bar for código/nombre
 * - Filters: sexo, estado, potrero
 * - AnimalTable with server-side pagination
 * - "Nuevo Animal" button → /dashboard/animales/nuevo
 * - Row click → /dashboard/animales/:id
 *
 * Route: /dashboard/animales
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter } from 'lucide-react';
import { usePredioStore } from '@/store/predio.store';
import { animalService } from '@/modules/animales/services';
import { AnimalTable } from '@/modules/animales/components/animal-table';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { AnimalEstadisticas } from '@/modules/animales/types/animal.types';
import type { Animal } from '@/modules/animales/types/animal.types';
import { SexoEnum, EstadoAnimalEnum } from '@ganatrack/shared-types';

export default function AnimalesListPage(): JSX.Element {
  const router = useRouter();
  const { predioActivo } = usePredioStore();

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filters state
  const [search, setSearch] = useState('');
  const [sexoKey, setSexoKey] = useState<number | undefined>(undefined);
  const [estadoAnimalKey, setEstadoAnimalKey] = useState<number | undefined>(undefined);

  // Data state
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [estadisticas, setEstadisticas] = useState<AnimalEstadisticas | null>(null);

  // Row selection for bulk actions
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Load animals
  useEffect(() => {
    async function loadAnimales() {
      if (!predioActivo?.id) return;

      try {
        setIsLoading(true);
        const result = await animalService.getAll({
          predioId: predioActivo.id,
          page: pageIndex + 1,
          limit: pageSize,
          search: search || undefined,
          sexoKey,
          estadoAnimalKey,
        });
        setAnimals(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }
    loadAnimales();
  }, [predioActivo?.id, pageIndex, pageSize, search, sexoKey, estadoAnimalKey]);

  // Load estadisticas
  useEffect(() => {
    async function loadEstadisticas() {
      if (!predioActivo?.id) return;

      try {
        const stats = await animalService.getEstadisticas(predioActivo.id);
        setEstadisticas(stats);
      } catch (err) {
        console.error('Error loading estadisticas:', err);
      }
    }
    loadEstadisticas();
  }, [predioActivo?.id]);

  // Handlers
  const handlePaginationChange = (pagination: { pageIndex: number; pageSize: number }) => {
    setPageIndex(pagination.pageIndex);
    setPageSize(pagination.pageSize);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0); // Reset to first page on search
  };

  const handleRowClick = (animal: Animal) => {
    router.push(`/dashboard/animales/${animal.id}`);
  };

  const handleFilterChange = (type: 'sexo' | 'estado', value: number | undefined) => {
    if (type === 'sexo') {
      setSexoKey(value);
    } else {
      setEstadoAnimalKey(value);
    }
    setPageIndex(0);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Error al cargar los animales
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
            Animales
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestiona el inventario de animales de tu predio
          </p>
        </div>
        <Link href="/dashboard/animales/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Animal
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      {estadisticas && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Activos
            </p>
            <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {estadisticas.activos}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              de {estadisticas.total} total
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Machos
            </p>
            <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {estadisticas.machos}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Hembras
            </p>
            <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {estadisticas.hembras}
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e: any) => handleSearchChange(e.target.value)}
            placeholder="Buscar por código o nombre..."
            className="flex w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 pl-10 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 px-4 py-2"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />

          {/* Sexo filter */}
          <select
            value={sexoKey ?? ''}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e: any) =>
              handleFilterChange(
                'sexo',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Todos los sexos</option>
            <option value={SexoEnum.MASCULINO}>Macho</option>
            <option value={SexoEnum.FEMENINO}>Hembra</option>
          </select>

          {/* Estado filter */}
          <select
            value={estadoAnimalKey ?? ''}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e: any) =>
              handleFilterChange(
                'estado',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Todos los estados</option>
            <option value={EstadoAnimalEnum.ACTIVO}>Activo</option>
            <option value={EstadoAnimalEnum.VENDIDO}>Vendido</option>
            <option value={EstadoAnimalEnum.MUERTO}>Muerto</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <AnimalTable
          animals={animals}
          isLoading={isLoading}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalRows={total}
          pageCount={totalPages}
          onPaginationChange={handlePaginationChange}
          onRowClick={handleRowClick}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
        />
      )}
    </div>
  );
}