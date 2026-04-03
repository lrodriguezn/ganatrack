// apps/web/src/app/dashboard/reportes/mortalidad/page.tsx
/**
 * Reporte Mortalidad — 3 charts: por causa, por rango edad, tendencia mensual.
 * Includes peak alert highlighting (>2x 6-month average).
 *
 * Route: /dashboard/reportes/mortalidad
 */

'use client';

import { HeartPulse, AlertTriangle } from 'lucide-react';
import { useReporteMortalidad } from '@/modules/reportes/hooks/use-reporte-mortalidad';
import { useFiltrosReportes } from '@/modules/reportes/hooks/use-filtros-reportes';
import { ReporteChart } from '@/modules/reportes/components/charts/reporte-chart';
import { ReporteFiltros as ReporteFiltrosComponent } from '@/modules/reportes/components/filters/reporte-filters';
import { ExportButton } from '@/modules/reportes/components/export/export-button';

export default function ReporteMortalidadPage(): JSX.Element {
  const { filtros } = useFiltrosReportes();
  const { data, isLoading, error, peakMonths } = useReporteMortalidad(filtros);

  const chartColors = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#ec4899'];

  const toSeries = (items: { label: string; value: number }[]) =>
    items.map((i) => i.value);
  const toLabels = (items: { label: string; value: number }[]) =>
    items.map((i) => i.label);
  const toTimeCategories = (items: { date: string }[]) =>
    items.map((i) => i.date);
  const toTimeValues = (items: { date: string; values: Record<string, number> }[], key: string) =>
    items.map((i) => i.values[key] ?? 0);

  const hasPeaks = peakMonths.size > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Reporte de Mortalidad
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Análisis de mortalidad por causa, edad y tendencia temporal
          </p>
        </div>
        <ExportButton reportType="mortalidad" filtros={filtros} />
      </div>

      <ReporteFiltrosComponent />

      {/* Peak alert */}
      {hasPeaks && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Se detectaron <strong>{peakMonths.size}</strong> mes(es) con mortalidad inusualmente alta
            (más del doble del promedio de 6 meses).
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>
        </div>
      )}

      {!isLoading && !error && !data?.graficos && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12 dark:border-gray-800 dark:bg-gray-900">
          <HeartPulse className="h-12 w-12 text-gray-400" />
          <p className="mt-4 text-base font-medium text-gray-900 dark:text-gray-100">
            Sin datos de mortalidad
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No se registran eventos de mortalidad en el período seleccionado
          </p>
        </div>
      )}

      {(isLoading || data?.graficos) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Por Causa — donut chart */}
          <ReporteChart
            type="donut"
            options={{
              chart: { id: 'mort-causa' },
              title: { text: 'Mortalidad por Causa', align: 'left' },
              labels: data ? toLabels(data.graficos.porCausa) : [],
              colors: chartColors,
              legend: { position: 'bottom' },
            }}
            series={data ? toSeries(data.graficos.porCausa) : []}
            loading={isLoading}
            error={error?.message}
          />

          {/* Por Rango de Edad — horizontal bar */}
          <ReporteChart
            type="bar"
            options={{
              chart: { id: 'mort-edad' },
              title: { text: 'Mortalidad por Rango de Edad', align: 'left' },
              xaxis: {
                categories: data ? toLabels(data.graficos.porRangoEdad) : [],
              },
              colors: [chartColors[0]!],
              plotOptions: { bar: { borderRadius: 4, horizontal: true } },
            }}
            series={[
              {
                name: 'Fallecimientos',
                data: data ? toSeries(data.graficos.porRangoEdad) : [],
              },
            ]}
            loading={isLoading}
            error={error?.message}
          />

          {/* Tendencia Mensual — line chart with peak highlights */}
          <div className="lg:col-span-2">
            <ReporteChart
              type="line"
              options={{
                chart: { id: 'mort-tendencia' },
                title: { text: 'Tendencia Mensual de Mortalidad', align: 'left' },
                xaxis: {
                  categories: data ? toTimeCategories(data.graficos.tendenciaMensual) : [],
                },
                yaxis: { title: { text: 'Fallecimientos' } },
                colors: [chartColors[0]!],
                stroke: { curve: 'smooth' },
                markers: {
                  size: data?.graficos.tendenciaMensual.map((_, i) =>
                    peakMonths.has(i) ? 8 : 0
                  ) ?? [],
                  colors: data?.graficos.tendenciaMensual.map((_, i) =>
                    peakMonths.has(i) ? '#ef4444' : '#ef4444'
                  ) ?? [],
                  strokeColors: data?.graficos.tendenciaMensual.map((_, i) =>
                    peakMonths.has(i) ? '#fff' : '#ef4444'
                  ) ?? [],
                  strokeWidth: data?.graficos.tendenciaMensual.map((_, i) =>
                    peakMonths.has(i) ? 2 : 0
                  ) ?? [],
                },
              }}
              series={[
                {
                  name: 'Fallecimientos',
                  data: data ? toTimeValues(data.graficos.tendenciaMensual, 'fallecimientos') : [],
                },
              ]}
              loading={isLoading}
              error={error?.message}
            />
          </div>
        </div>
      )}
    </div>
  );
}
