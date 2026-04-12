// apps/web/src/app/dashboard/reportes/inventario/page.tsx
/**
 * Reporte Inventario — 4 charts: por predio, raza, estado, sexo.
 *
 * Route: /dashboard/reportes/inventario
 */

'use client';

import { Archive, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { useReporteInventario } from '@/modules/reportes/hooks/use-reporte-inventario';
import { usePredioRequerido } from '@/shared/hooks';
import { useFiltrosReportes } from '@/modules/reportes/hooks/use-filtros-reportes';
import { ReporteChart } from '@/modules/reportes/components/charts/reporte-chart';
import { ReporteFiltros as ReporteFiltrosComponent } from '@/modules/reportes/components/filters/reporte-filters';
import { ExportButton } from '@/modules/reportes/components/export/export-button';

export default function ReporteInventarioPage(): JSX.Element | null {
  const { filtros } = useFiltrosReportes();
  const { data, isLoading, error } = useReporteInventario(filtros);

  const chartColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Transform data for ApexCharts
  const toSeries = (items: { label: string; value: number }[]) =>
    items.map((i) => i.value);
  const toLabels = (items: { label: string; value: number }[]) =>
    items.map((i) => i.label);

  const { predioActivo, isLoading: predioLoading } = usePredioRequerido();
  if (predioLoading || !predioActivo) return null;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Reporte de Inventario
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Distribución de animales por predio, raza, estado y sexo
          </p>
        </div>
        <ExportButton reportType="inventario" filtros={filtros} />
      </div>

      {/* Filters */}
      <ReporteFiltrosComponent />

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && data && data.resumen.totalAnimales === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12 dark:border-gray-800 dark:bg-gray-900">
          <Archive className="h-12 w-12 text-gray-400" />
          <p className="mt-4 text-base font-medium text-gray-900 dark:text-gray-100">
            Sin datos de inventario
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Agregue animales al predio para ver el reporte
          </p>
        </div>
      )}

      {/* Charts */}
      {(isLoading || (data && data.resumen.totalAnimales > 0)) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Por Predio — bar chart */}
          <ReporteChart
            type="bar"
            options={{
              chart: { id: 'inv-predio' },
              title: { text: 'Animales por Predio', align: 'left' },
              xaxis: {
                categories: data ? toLabels(data.graficos.porPredio) : [],
              },
              colors: [chartColors[0]!],
              plotOptions: { bar: { borderRadius: 4, horizontal: true } },
            }}
            series={[
              {
                name: 'Animales',
                data: data ? toSeries(data.graficos.porPredio) : [],
              },
            ]}
            loading={isLoading}
            error={error?.message}
          />

          {/* Por Raza — donut chart */}
          <ReporteChart
            type="donut"
            options={{
              chart: { id: 'inv-raza' },
              title: { text: 'Animales por Raza', align: 'left' },
              labels: data ? toLabels(data.graficos.porRaza) : [],
              colors: chartColors,
              legend: { position: 'bottom' },
            }}
            series={data ? toSeries(data.graficos.porRaza) : []}
            loading={isLoading}
            error={error?.message}
          />

          {/* Por Estado — horizontal bar */}
          <ReporteChart
            type="bar"
            options={{
              chart: { id: 'inv-estado' },
              title: { text: 'Animales por Estado', align: 'left' },
              xaxis: {
                categories: data ? toLabels(data.graficos.porEstado) : [],
              },
              colors: [chartColors[1]!],
              plotOptions: { bar: { borderRadius: 4, horizontal: true } },
            }}
            series={[
              {
                name: 'Animales',
                data: data ? toSeries(data.graficos.porEstado) : [],
              },
            ]}
            loading={isLoading}
            error={error?.message}
          />

          {/* Por Sexo — donut chart */}
          <ReporteChart
            type="donut"
            options={{
              chart: { id: 'inv-sexo' },
              title: { text: 'Animales por Sexo', align: 'left' },
              labels: data ? toLabels(data.graficos.porSexo) : [],
              colors: [chartColors[2]!, chartColors[3]!],
              legend: { position: 'bottom' },
            }}
            series={data ? toSeries(data.graficos.porSexo) : []}
            loading={isLoading}
            error={error?.message}
          />
        </div>
      )}
    </div>
  );
}
