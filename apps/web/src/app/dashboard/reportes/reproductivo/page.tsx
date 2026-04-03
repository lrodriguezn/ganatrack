// apps/web/src/app/dashboard/reportes/reproductivo/page.tsx
/**
 * Reporte Reproductivo — 4 charts: tasa concepción, servicios/mes, intervalo partos, tasa preñez.
 *
 * Route: /dashboard/reportes/reproductivo
 */

'use client';

import { Baby } from 'lucide-react';
import { useReporteReproductivo } from '@/modules/reportes/hooks/use-reporte-reproductivo';
import { useFiltrosReportes } from '@/modules/reportes/hooks/use-filtros-reportes';
import { ReporteChart } from '@/modules/reportes/components/charts/reporte-chart';
import { ReporteFiltros as ReporteFiltrosComponent } from '@/modules/reportes/components/filters/reporte-filters';
import { ExportButton } from '@/modules/reportes/components/export/export-button';

export default function ReporteReproductivoPage(): JSX.Element {
  const { filtros } = useFiltrosReportes();
  const { data, isLoading, error } = useReporteReproductivo(filtros);

  const chartColors = ['#ec4899', '#8b5cf6', '#f59e0b', '#10b981'];

  const toSeries = (items: { label: string; value: number }[]) =>
    items.map((i) => i.value);
  const toLabels = (items: { label: string; value: number }[]) =>
    items.map((i) => i.label);

  // Transform time series for line/bar charts
  const toTimeCategories = (items: { date: string }[]) =>
    items.map((i) => i.date);
  const toTimeValues = (items: { date: string; values: Record<string, number> }[], key: string) =>
    items.map((i) => i.values[key] ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Reporte Reproductivo
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Indicadores de fertilidad y desempeño reproductivo
          </p>
        </div>
        <ExportButton reportType="reproductivo" filtros={filtros} />
      </div>

      <ReporteFiltrosComponent />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>
        </div>
      )}

      {!isLoading && !error && !data?.graficos && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12 dark:border-gray-800 dark:bg-gray-900">
          <Baby className="h-12 w-12 text-gray-400" />
          <p className="mt-4 text-base font-medium text-gray-900 dark:text-gray-100">
            Sin datos reproductivos
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Registre servicios, palpaciones o partos para ver el reporte
          </p>
        </div>
      )}

      {(isLoading || data?.graficos) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Tasa de Concepción — line chart */}
          <ReporteChart
            type="line"
            options={{
              chart: { id: 'rep-concepcion' },
              title: { text: 'Tasa de Concepción', align: 'left' },
              xaxis: {
                categories: data ? toLabels(data.graficos.tasaConcepcion) : [],
              },
              yaxis: { title: { text: 'Porcentaje (%)' } },
              colors: [chartColors[0]!],
              stroke: { curve: 'smooth' },
            }}
            series={[
              {
                name: 'Concepción %',
                data: data ? toSeries(data.graficos.tasaConcepcion) : [],
              },
            ]}
            loading={isLoading}
            error={error?.message}
          />

          {/* Servicios por Mes — bar chart */}
          <ReporteChart
            type="bar"
            options={{
              chart: { id: 'rep-servicios' },
              title: { text: 'Servicios por Mes', align: 'left' },
              xaxis: {
                categories: data ? toTimeCategories(data.graficos.serviciosPorMes) : [],
              },
              colors: [chartColors[1]!],
              plotOptions: { bar: { borderRadius: 4 } },
            }}
            series={[
              {
                name: 'Servicios',
                data: data ? toTimeValues(data.graficos.serviciosPorMes, 'servicios') : [],
              },
            ]}
            loading={isLoading}
            error={error?.message}
          />

          {/* Intervalo entre Partos — bar chart */}
          <ReporteChart
            type="bar"
            options={{
              chart: { id: 'rep-intervalo' },
              title: { text: 'Intervalo entre Partos (días)', align: 'left' },
              xaxis: {
                categories: data ? toLabels(data.graficos.intervaloPartos) : [],
              },
              yaxis: { title: { text: 'Días' } },
              colors: [chartColors[2]!],
              plotOptions: { bar: { borderRadius: 4 } },
            }}
            series={[
              {
                name: 'Días',
                data: data ? toSeries(data.graficos.intervaloPartos) : [],
              },
            ]}
            loading={isLoading}
            error={error?.message}
          />

          {/* Tasa de Preñez Mensual — area chart */}
          <ReporteChart
            type="area"
            options={{
              chart: { id: 'rep-prenez' },
              title: { text: 'Tasa de Preñez Mensual', align: 'left' },
              xaxis: {
                categories: data ? toTimeCategories(data.graficos.tasaPrenezMensual) : [],
              },
              yaxis: { title: { text: 'Porcentaje (%)' } },
              colors: [chartColors[3]!],
              stroke: { curve: 'smooth' },
              fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.1 } },
            }}
            series={[
              {
                name: 'Preñez %',
                data: data ? toTimeValues(data.graficos.tasaPrenezMensual, 'prenez') : [],
              },
            ]}
            loading={isLoading}
            error={error?.message}
          />
        </div>
      )}
    </div>
  );
}
