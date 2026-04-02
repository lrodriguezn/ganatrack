// apps/web/src/app/(dashboard)/page.tsx
/**
 * Dashboard home page — basic overview with mock data.
 *
 * Displays:
 * - KPI stat cards (total animales, en ordeño, producción, alertas)
 * - Recent activity table
 * - Quick actions
 *
 * All data is MOCK — will be replaced with real API calls in future phases.
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
} from 'lucide-react';
/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const stats = [
  {
    label: 'Total Animales',
    value: '1,247',
    change: '+12 este mes',
    icon: Beef,
    color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950',
  },
  {
    label: 'En Ordeño',
    value: '342',
    change: '27.4% del hato',
    icon: Droplets,
    color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950',
  },
  {
    label: 'Producción Diaria',
    value: '2,856 L',
    change: '+5.2% vs semana anterior',
    icon: TrendingUp,
    color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950',
  },
  {
    label: 'Alertas Activas',
    value: '8',
    change: '3 urgentes',
    icon: Bell,
    color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
  },
];

const recentActivity = [
  {
    id: 1,
    action: 'Registro de parto',
    animal: 'Vaca #0247 — Luna',
    date: '02 Abr 2026, 08:30',
    user: 'Dr. García',
    status: 'completado' as const,
  },
  {
    id: 2,
    action: 'Vacunación Aftosa',
    animal: 'Lote Norte — 85 animales',
    date: '01 Abr 2026, 15:00',
    user: 'Carlos M.',
    status: 'completado' as const,
  },
  {
    id: 3,
    action: 'Control de peso',
    animal: 'Lote Engorde — 120 animales',
    date: '01 Abr 2026, 10:00',
    user: 'María L.',
    status: 'en_progreso' as const,
  },
  {
    id: 4,
    action: 'Alerta sanitaria',
    animal: 'Vaca #0189 — Estrella',
    date: '31 Mar 2026, 16:45',
    user: 'Sistema',
    status: 'pendiente' as const,
  },
  {
    id: 5,
    action: 'Inseminación artificial',
    animal: 'Vaca #0312 — Paloma',
    date: '31 Mar 2026, 09:00',
    user: 'Dr. García',
    status: 'completado' as const,
  },
];

const quickActions = [
  { label: 'Registrar Animal', icon: Plus, description: 'Agregar nuevo animal al hato' },
  { label: 'Nuevo Evento Sanitario', icon: Syringe, description: 'Vacunación, desparasitación, etc.' },
  { label: 'Registrar Producción', icon: BarChart3, description: 'Litros de leche por ordeño' },
  { label: 'Programar Evento', icon: CalendarDays, description: 'Agendar próxima actividad' },
];

const statusMap = {
  completado: { label: 'Completado', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  en_progreso: { label: 'En Progreso', className: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  pendiente: { label: 'Pendiente', className: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' },
} as const;

function StatusBadge({ status }: { status: keyof typeof statusMap }) {
  const { label, className } = statusMap[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DashboardPage(): JSX.Element {
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2.5 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.label}
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Two-column: Activity + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Actividad Reciente
            </h2>
            <button className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
              Ver todo <MoveRight className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Acción
                  </th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Animal / Lote
                  </th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">
                    Fecha
                  </th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                    Usuario
                  </th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-50 last:border-0 dark:border-gray-800/50"
                  >
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {item.action}
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                      {item.animal}
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell">
                      {item.date}
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      {item.user}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                <button
                  key={action.label}
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
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
