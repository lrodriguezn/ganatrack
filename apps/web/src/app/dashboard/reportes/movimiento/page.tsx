// apps/web/src/app/dashboard/reportes/movimiento/page.tsx
/**
 * Reporte Movimiento — compras vs ventas, saldo neto, costos.
 *
 * Route: /dashboard/reportes/movimiento
 */

'use client';

import { ArrowLeftRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useReporteMovimiento } from '@/modules/reportes/hooks/use-reporte-movimiento';
import { usePredioRequerido } from '@/shared/hooks';
import { useFiltrosReportes } from '@/modules/reportes/hooks/use-filtros-reportes';
import { ReporteChart } from '@/modules/reportes/components/charts/reporte-chart';
import { ReporteFiltros as ReporteFiltrosComponent } from '@/modules/reportes/components/filters/reporte-filters';
import { ExportButton } from '@/modules/reportes/components/export/export-button';

export default function ReporteMovimientoPage(): JSX.Element | null {
  const { filtros } = useFiltrosReportes();
  const { data, isLoading, error, saldoNeto } = useReporteMovimiento(filtros);

  const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const toTimeCategories = (items: { date: string }[]) =>
    items.map((i) => i.date);
  const toTimeValues = (items: { date: string; values: Record<string, number> }[], key: string) =>
    items.map((i) => i.values[key] ?? 0);

  const saldoPositive = saldoNeto >= 0;

  const { predioActivo, isLoading: predioLoading } = usePredioRequerido();
  if (predioLoading || !predioActivo) return null;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Reporte de Movimiento
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Análisis de compras, ventas y costos de transacciones
          </p>
        </div>
        <ExportButton reportType="movimiento" filtros={filtros} />
      </div>

      <ReporteFiltrosComponent />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>
        </div>
      )}

      {/* Saldo Neto KPI */}
      {!isLoading && data?.graficos && (
        <div
          className={`rounded-xl border p-5 ${
            saldoPositive
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950'
              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
          }`}
        >
          <div className="flex items-center gap-3">
            {saldoPositive ? (
              <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            )}
            <div>
              <p className={`text-sm font-medium ${saldoPositive ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                Saldo Neto del Período
              </p>
              <p className={`text-2xl font-bold ${saldoPositive ? 'text-emerald-900 dark:text-emerald-100' : 'text-red-900 dark:text-red-100'}`}>
                {saldoPositive ? '+' : ''}{saldoNeto} animales
              </p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && !data?.graficos && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12 dark:border-gray-800 dark:bg-gray-900">
          <ArrowLeftRight className="h-12 w-12 text-gray-400" />
          <p className="mt-4 text-base font-medium text-gray-900 dark:text-gray-100">
            Sin movimientos registrados
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Registre compras o ventas para ver el reporte
          </p>
        </div>
      )}

      {(isLoading || data?.graficos) && (
        <div className="grid grid-cols-1 gap-6">
          {/* Compras vs Ventas — grouped bar chart */}
          <ReporteChart
            type="bar"
            options={{
              chart: { id: 'mov-compras-ventas' },
              title: { text: 'Compras vs Ventas por Mes', align: 'left' },
              xaxis: {
                categories: data ? toTimeCategories(data.graficos.comprasVsVentas) : [],
              },
              yaxis: { title: { text: 'Cantidad de animales' } },
              colors: [chartColors[0]!, chartColors[1]!],
              plotOptions: { bar: { borderRadius: 4 } },
              stroke: { show: true, width: 1, colors: ['transparent'] },
            }}
            series={[
              {
                name: 'Compras',
                data: data ? toTimeValues(data.graficos.comprasVsVentas, 'compras') : [],
              },
              {
                name: 'Ventas',
                data: data ? toTimeValues(data.graficos.comprasVsVentas, 'ventas') : [],
              },
            ]}
            loading={isLoading}
            error={error?.message}
          />

          {/* Saldo de Animales — area chart */}
          <ReporteChart
            type="area"
            options={{
              chart: { id: 'mov-saldo' },
              title: { text: 'Saldo de Animales Acumulado', align: 'left' },
              xaxis: {
                categories: data ? toTimeCategories(data.graficos.saldoAnimales) : [],
              },
              yaxis: { title: { text: 'Animales' } },
              colors: [chartColors[2]!],
              stroke: { curve: 'smooth' },
              fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.1 } },
            }}
            series={[
              {
                name: 'Saldo',
                data: data ? toTimeValues(data.graficos.saldoAnimales, 'saldo') : [],
              },
            ]}
            loading={isLoading}
            error={error?.message}
          />

          {/* Costos por Mes — bar chart */}
          <ReporteChart
            type="bar"
            options={{
              chart: { id: 'mov-costos' },
              title: { text: 'Costos de Transacciones por Mes', align: 'left' },
              xaxis: {
                categories: data ? toTimeCategories(data.graficos.costosPorMes) : [],
              },
              yaxis: { title: { text: 'Costo' } },
              colors: [chartColors[3]!],
              plotOptions: { bar: { borderRadius: 4 } },
            }}
            series={[
              {
                name: 'Costos',
                data: data ? toTimeValues(data.graficos.costosPorMes, 'costos') : [],
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
