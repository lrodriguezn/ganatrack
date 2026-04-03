// apps/web/src/modules/reportes/components/dashboard/kpi-card.tsx
/**
 * KpiCard — Reusable KPI card with skeleton state and trend indicator.
 *
 * Props:
 * - label: string
 * - value: string | number
 * - change?: string
 * - icon: LucideIcon
 * - color: string (Tailwind classes)
 * - loading?: boolean
 */

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface KpiCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  color: string; // Tailwind classes for icon background
  loading?: boolean;
}

export function KpiCard({
  label,
  value,
  change,
  icon: Icon,
  color,
  loading = false,
}: KpiCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="mt-3 h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mt-1 h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <div className={cn('rounded-lg p-2.5', color)}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
      {change && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {change}
        </p>
      )}
    </div>
  );
}
