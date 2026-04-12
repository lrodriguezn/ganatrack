// apps/web/src/app/dashboard/reportes/sanitario/page.tsx
/**
 * Reporte Sanitario — eventos por tipo, vacunaciones pendientes, tratamientos.
 *
 * Route: /dashboard/reportes/sanitario
 */

'use client';

import { Stethoscope, AlertCircle } from 'lucide-react';
import { useReporteSanitario } from '@/modules/reportes/hooks/use-reporte-sanitario';
import { usePredioRequerido } from '@/shared/hooks';
import { useFiltrosReportes } from '@/modules/reportes/hooks/use-filtros-reportes';
import { ReporteChart } from '@/modules/reportes/components/charts/reporte-chart';
import { ReporteFiltros as ReporteFiltrosComponent } from '@/modules/reportes/components/filters/reporte-filters';
import { ExportButton } from '@/modules/reportes/components/export/export-button';

export default function ReporteSanitarioPage(): JSX.Element | null {
  const { filtros } = useFiltrosReportes();
  const { data, isLoading, error } = useReporteSanitario(filtros);

  const chartColors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

  const toSeries = (items: { label: string; value: number }[]) =>
    items.map((i) => i.value);
  const toLabels = (items: { label: string; value: number }[]) =>
    items.map((i) => i.label);
  const toTimeCategories = (items: { date: string }[]) =>
    items.map((i) => i.date);
  const toTimeValues = (items: { date: string; values: Record<string, number> }[], key: string) =>
    items.map((i) => i.values[key] ?? 0);

  const { predioActivo, isLoading: predioLoading } = usePredioRequerido();
  if (predioLoading || !predioActivo) return null;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Reporte Sanitario
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Eventos sanitarios, vacunaciones y tratamientos
          </p>
        </div>
        <ExportButton reportType="sanitario" filtros={filtros} />
      </div>

      <ReporteFiltrosComponent />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>
        </div>
      )}

      {!isLoading && !error && !data?.graficos && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12 dark:border-gray-800 dark:bg-gray-900">
          <Stethoscope className="h-12 w-12 text-gray-400" />
          <p className="mt-4 text-base font-medium text-gray-900 dark:text-gray-100">
            Sin eventos sanitarios
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Registre vacunaciones o tratamientos para ver el reporte
          </p>
        </div>
      )}

      {(isLoading || data?.graficos) && (
        <div className="space-y-6">
          {/* Eventos por Tipo — stacked bar chart */}
          <ReporteChart
            type="bar"
            options={{
              chart: { id: 'san-eventos', stacked: true },
              title: { text: 'Eventos Sanitarios por Tipo y Mes', align: 'left' },
              xaxis: {
                categories: data ? toTimeCategories(data.graficos.vacunaciones) : [],
              },
              yaxis: { title: { text: 'Eventos' } },
              colors: chartColors,
              plotOptions: { bar: { borderRadius: 4 } },
              stroke: { show: true, width: 1, colors: ['transparent'] },
              legend: { position: 'bottom' },
            }}
            series={data?.graficos.eventosPorTipo.map((tipo, idx) => ({
              name: tipo.label,
              data: data ? toTimeValues(data.graficos.vacunaciones, tipo.label.toLowerCase()) : [],
            })) ?? []}
            loading={isLoading}
            error={error?.message}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Vacunaciones — line chart */}
            <ReporteChart
              type="line"
              options={{
                chart: { id: 'san-vacunas' },
                title: { text: 'Vacunaciones por Mes', align: 'left' },
                xaxis: {
                  categories: data ? toTimeCategories(data.graficos.vacunaciones) : [],
                },
                yaxis: { title: { text: 'Vacunaciones' } },
                colors: [chartColors[0]!],
                stroke: { curve: 'smooth' },
              }}
              series={[
                {
                  name: 'Vacunaciones',
                  data: data ? toTimeValues(data.graficos.vacunaciones, 'total') : [],
                },
              ]}
              loading={isLoading}
              error={error?.message}
            />

            {/* Tratamientos — bar chart */}
            <ReporteChart
              type="bar"
              options={{
                chart: { id: 'san-tratamientos' },
                title: { text: 'Tratamientos por Mes', align: 'left' },
                xaxis: {
                  categories: data ? toTimeCategories(data.graficos.tratamientos) : [],
                },
                yaxis: { title: { text: 'Tratamientos' } },
                colors: [chartColors[3]!],
                plotOptions: { bar: { borderRadius: 4 } },
              }}
              series={[
                {
                  name: 'Tratamientos',
                  data: data ? toTimeValues(data.graficos.tratamientos, 'total') : [],
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
