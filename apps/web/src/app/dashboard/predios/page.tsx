// apps/web/src/app/dashboard/predios/page.tsx
/**
 * Predios list page — displays all predios with search and pagination.
 *
 * Features:
 * - Search input for filtering by nombre
 * - "Nuevo Predio" button linking to create page
 * - PredioTable component for display
 * - Edit/Delete actions per row
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { usePredios } from '@/modules/predios/hooks';
import { PredioTable } from '@/modules/predios/components/predio-table';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';

export default function PrediosListPage(): JSX.Element {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { predios, isLoading, error } = usePredios({ search });

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0); // Reset to first page on search
  };

  const handleEdit = (predio: typeof predios[number]) => {
    router.push(`/dashboard/predios/${predio.id}/edit`);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Error al cargar los predios
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          {(error as Error).message}
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
            Predios
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestiona los predios de tu operación ganadera
          </p>
        </div>
        <Link href="/dashboard/predios/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Predio
          </Button>
        </Link>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <PredioTable
          predios={predios}
          isLoading={isLoading}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalRows={predios.length}
          onPaginationChange={handlePaginationChange}
          onEdit={handleEdit}
          searchValue={search}
          onSearchChange={handleSearchChange}
        />
      )}
    </div>
  );
}
