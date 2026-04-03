// apps/web/src/app/dashboard/page.tsx
/**
 * Dashboard home page — KPIs from API + recent activity.
 *
 * Displays:
 * - KPI stat cards (from useDashboardKPIs — real API data)
 * - Recent activity table
 * - Quick actions
 */

'use client';

import {
  BarChart3,
  Beef,
  Bell,
  CalendarDays,
  Droplets,
  MoveRight,
  Plus,
  Syringe,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { useDashboardKPIs } from '@/modules/reportes/hooks/use-dashboard-kpis';
import { usePredioStore } from '@/store/predio.store';
import { KpiCard } from '@/modules/reportes/components/dashboard/kpi-card';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Quick actions (keep static)                                        */
/* ------------------------------------------------------------------ */

const quickActions = [
  { label: 'Registrar Animal', icon: Plus, description: 'Agregar nuevo animal al hato', href: '/dashboard/animales/nuevo' },
  { label: 'Nuevo Evento Sanitario', icon: Syringe, description: 'Vacunación, desparasitación, etc.', href: '/dashboard/servicios/palpaciones/nuevo' },
  { label: 'Ver Reportes', icon: BarChart3, description: 'Inventario, reproductivo, mortalidad', href: '/dashboard/reportes' },
  { label: 'Programar Evento', icon: CalendarDays, description: 'Agendar próxima actividad', href: '/dashboard/servicios' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DashboardPage(): JSX.Element {
  const { predioActivo } = usePredioStore();
  const { data, isLoading, error, refetch } = useDashboardKPIs(predioActivo?.id ?? 0);

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Resumen general de tu operación ganadera
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <div className="flex-1">
            <p className="text-sm text-red-600 dark:text-red-400">
              Error al cargar los KPIs: {error.message}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* KPI Cards — real API data */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Animales"
          value={data?.totalAnimales.toLocaleString('es-CO') ?? '—'}
          change={isLoading ? undefined : 'En el predio activo'}
          icon={Beef}
          color="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950"
          loading={isLoading}
        />
        <KpiCard
          label="En Ordeño"
          value={data?.enOrdeno.toLocaleString('es-CO') ?? '—'}
          change={data ? `${data.totalAnimales > 0 ? ((data.enOrdeno / data.totalAnimales) * 100).toFixed(1) : 0}% del hato` : undefined}
          icon={Droplets}
          color="text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950"
          loading={isLoading}
        />
        <KpiCard
          label="Tasa de Preñez"
          value={data ? `${data.tasaPrenez.toFixed(1)}%` : '—'}
          change="Período actual"
          icon={(data?.tasaPrenez ?? 0) >= 50 ? TrendingUp : TrendingDown}
          color={(data?.tasaPrenez ?? 0) >= 50
            ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950'
            : 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950'}
          loading={isLoading}
        />
        <KpiCard
          label="Mortalidad Mensual"
          value={data ? `${data.mortalidadMensual.toFixed(1)}%` : '—'}
          change={data && data.mortalidadMensual > 5 ? 'Por encima del umbral' : 'Dentro de lo normal'}
          icon={data && data.mortalidadMensual > 5 ? AlertTriangle : Bell}
          color={data && data.mortalidadMensual > 5
            ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950'
            : 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950'}
          loading={isLoading}
        />
      </div>

      {/* Two-column: Movements summary + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Compras/Ventas del mes */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Movimientos del Mes
            </h2>
            <Link
              href="/dashboard/reportes/movimiento"
              className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              Ver reporte <MoveRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 p-5">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Compras</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data?.comprasMes.toLocaleString('es-CO') ?? '—'}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ventas</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data?.ventasMes.toLocaleString('es-CO') ?? '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Acciones Rápidas
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {action.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
