// apps/web/src/app/dashboard/servicios/inseminaciones/page.tsx
/**
 * Inseminaciones list page — listado de eventos grupales de inseminación.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { usePredioRequerido } from '@/shared/hooks';
import { useInseminaciones } from '@/modules/servicios';
import { InseminacionesTable } from '@/modules/servicios/components/inseminaciones-table';
import { Button } from '@/shared/components/ui/button';

export default function InseminacionesListPage(): JSX.Element | null {
  const { predioActivo, isLoading: predioLoading } = usePredioRequerido();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useInseminaciones({
    predioId: predioActivo?.id ?? 0,
    page: pageIndex + 1,
    limit: pageSize,
  });

  if (predioLoading || !predioActivo) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Inseminaciones</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestión de eventos grupales de inseminación artificial
          </p>
        </div>
        <Link href="/dashboard/servicios/inseminaciones/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Inseminación
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Eventos</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isLoading ? '...' : data?.total ?? 0}
          </p>
        </div>
      </div>

      {/* Table */}
      <InseminacionesTable
        data={data}
        isLoading={isLoading}
        page={pageIndex}
        limit={pageSize}
        onPaginationChange={({ pageIndex: pi, pageSize: ps }) => {
          setPageIndex(pi);
          setPageSize(ps);
        }}
      />
    </div>
  );
}
