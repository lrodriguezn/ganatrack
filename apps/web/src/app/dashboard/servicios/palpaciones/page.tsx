// apps/web/src/app/dashboard/servicios/palpaciones/page.tsx
/**
 * Palpaciones list page — listado de eventos grupales de palpación.
 *
 * KPIs: total palpaciones, tasa preñez
 * Table: código, fecha, veterinario, # animales, acciones
 * Button: "Nueva Palpación" → /dashboard/servicios/palpaciones/nuevo
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { usePredioStore } from '@/store/predio.store';
import { usePalpaciones } from '@/modules/servicios';
import { PalpacionesTable } from '@/modules/servicios/components/palpaciones-table';
import { Button } from '@/shared/components/ui/button';

export default function PalpacionesListPage(): JSX.Element {
  const { predioActivo } = usePredioStore();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = usePalpaciones({
    predioId: predioActivo?.id ?? 0,
    page: pageIndex + 1,
    limit: pageSize,
  });

  // Calculate KPIs from visible data
  const totalEventos = data?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Palpaciones</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestión de eventos grupales de palpación reproductiva
          </p>
        </div>
        <Link href="/dashboard/servicios/palpaciones/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Palpación
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Eventos</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isLoading ? '...' : totalEventos}
          </p>
        </div>
      </div>

      {/* Table */}
      <PalpacionesTable
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
