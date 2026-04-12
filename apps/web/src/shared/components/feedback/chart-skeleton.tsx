// apps/web/src/shared/components/feedback/chart-skeleton.tsx
/**
 * ChartSkeleton — Rectangular skeleton matching ApexCharts container dimensions.
 *
 * Used as loading placeholder for chart components (ApexCharts, etc.).
 * Renders a container with border matching ReporteChart styles and an
 * inner skeleton shaped like a chart area.
 *
 * @example
 * <ChartSkeleton />
 * <ChartSkeleton height={400} animation="wave" />
 */

'use client';

import { Skeleton } from '@/shared/components/ui/skeleton';
import { twMerge } from 'tailwind-merge';

interface ChartSkeletonProps {
  height?: number | string;
  animation?: 'pulse' | 'wave';
  className?: string;
}

export function ChartSkeleton({
  height = 350,
  animation = 'pulse',
  className,
}: ChartSkeletonProps): JSX.Element {
  const heightValue = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      role="status"
      aria-label="Cargando gráfico"
      aria-busy="true"
      className={twMerge(
        'rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900',
        className,
      )}
      style={{ height: heightValue }}
    >
      {/* Chart area skeleton */}
      <div className="flex h-full flex-col justify-end gap-2">
        {/* Faux bars/lines at bottom */}
        <div className="flex items-end gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              animation={animation}
              className="flex-1"
              height={`${20 + Math.sin(i * 0.5) * 30 + 30}%`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
