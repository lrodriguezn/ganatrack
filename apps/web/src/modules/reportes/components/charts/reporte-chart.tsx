// apps/web/src/modules/reportes/components/charts/reporte-chart.tsx
/**
 * ReporteChart — Generic ApexCharts wrapper via next/dynamic (ssr: false).
 *
 * Props:
 * - options: ApexCharts.ApexOptions
 * - series: ApexAxisChartSeries | ApexNonAxisChartSeries
 * - type: 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'radialBar'
 * - height?: number | string (default 350)
 * - loading?: boolean
 * - error?: string
 * - className?: string
 *
 * Responsive config for mobile (breakpoint 640px).
 * Skeleton loader while loading.
 */

'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/shared/lib/utils';

// Lazy-load ApexCharts — ~460KB, only loads when chart is rendered
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[350px] animate-pulse items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
      <div className="h-4 w-32 rounded bg-gray-300 dark:bg-gray-700" />
    </div>
  ),
});

interface ReporteChartProps {
  options: ApexCharts.ApexOptions;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  type: 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'radialBar';
  height?: number | string;
  loading?: boolean;
  error?: string;
  className?: string;
}

export function ReporteChart({
  options,
  series,
  type,
  height = 350,
  loading = false,
  error,
  className,
}: ReporteChartProps) {
  const responsiveOptions: ApexCharts.ApexResponsive[] = [
    {
      breakpoint: 640, // sm
      options: {
        chart: { height: typeof height === 'number' ? 280 : height },
        legend: { position: 'bottom' as const, fontSize: '11px' },
      },
    },
  ];

  if (loading) {
    return (
      <div
        className={cn(
          'animate-pulse rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900',
          className,
        )}
        style={{ height: typeof height === 'number' ? height : undefined }}
      >
        <div className="flex h-full items-center justify-center">
          <div className="h-4 w-32 rounded bg-gray-300 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950',
          className,
        )}
        style={{ height: typeof height === 'number' ? height : undefined }}
      >
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900', className)}>
      <ReactApexChart
        options={{
          ...options,
          responsive: [...(options.responsive ?? []), ...responsiveOptions],
        }}
        series={series}
        type={type}
        height={height}
      />
    </div>
  );
}
