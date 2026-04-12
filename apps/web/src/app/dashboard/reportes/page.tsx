// apps/web/src/app/dashboard/reportes/page.tsx
/**
 * Reportes index page — sub-navigation to 5 report types.
 *
 * Route: /dashboard/reportes
 */

'use client';

import { usePredioRequerido } from '@/shared/hooks';
import Link from 'next/link';
import {
  Archive,
  Baby,
  HeartPulse,
  ArrowLeftRight,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';

const reportes = [
  {
    label: 'Inventario',
    href: '/dashboard/reportes/inventario',
    icon: Archive,
    description: 'Animales por predio, raza, estado y sexo',
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  },
  {
    label: 'Reproductivo',
    href: '/dashboard/reportes/reproductivo',
    icon: Baby,
    description: 'Tasa de concepción, servicios y preñez',
    color: 'bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400',
  },
  {
    label: 'Mortalidad',
    href: '/dashboard/reportes/mortalidad',
    icon: HeartPulse,
    description: 'Mortalidad por causa, edad y tendencia',
    color: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
  },
  {
    label: 'Movimiento',
    href: '/dashboard/reportes/movimiento',
    icon: ArrowLeftRight,
    description: 'Compras vs ventas, saldo y costos',
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  },
  {
    label: 'Sanitario',
    href: '/dashboard/reportes/sanitario',
    icon: Stethoscope,
    description: 'Eventos sanitarios, vacunaciones y tratamientos',
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  },
];

export default function ReportesPage(): JSX.Element | null {
  const { predioActivo, isLoading: predioLoading } = usePredioRequerido();
  if (predioLoading || !predioActivo) return null;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Reportes
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Analiza el rendimiento de tu operación ganadera
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportes.map((r) => {
          const Icon = r.icon;
          return (
            <Link
              key={r.href}
              href={r.href}
              className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div className={`rounded-lg p-3 ${r.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {r.label}
                </p>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 truncate">
                  {r.description}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
