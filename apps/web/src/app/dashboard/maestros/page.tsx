// apps/web/src/app/dashboard/maestros/page.tsx
/**
 * Maestros overview page — grid of 8 entity cards.
 *
 * Each card links to the corresponding maestro entity page.
 */

'use client';

import Link from 'next/link';
import { memo } from 'react';

interface MaestroCard {
  title: string;
  description: string;
  href: string;
  icon: string;
}

const MAESTROS_CARDS: MaestroCard[] = [
  {
    title: 'Veterinarios',
    description: 'Gestiona los veterinarios que prestan servicios en tus predios',
    href: '/dashboard/maestros/veterinarios',
    icon: '🩺',
  },
  {
    title: 'Propietarios',
    description: 'Administra la información de los propietarios de animales',
    href: '/dashboard/maestros/propietarios',
    icon: '👤',
  },
  {
    title: 'Hierros',
    description: 'Registra los hierros y marcas de identificación del ganado',
    href: '/dashboard/maestros/hierros',
    icon: '🔥',
  },
  {
    title: 'Diagnósticos',
    description: 'Catálogo de diagnósticos y enfermedades frecuentes',
    href: '/dashboard/maestros/diagnosticos',
    icon: '🔬',
  },
  {
    title: 'Motivos de Venta',
    description: 'Razones por las que se realiza la venta de un animal',
    href: '/dashboard/maestros/motivos-ventas',
    icon: '💰',
  },
  {
    title: 'Causas de Muerte',
    description: 'Causas registradas de muerte de animales en el hato',
    href: '/dashboard/maestros/causas-muerte',
    icon: '📋',
  },
  {
    title: 'Lugares de Compra',
    description: 'Ferias, subastas y proveedores donde se compra ganado',
    href: '/dashboard/maestros/lugares-compras',
    icon: '🏪',
  },
  {
    title: 'Lugares de Venta',
    description: 'Mercados, frigoríficos y destinos de venta de animales',
    href: '/dashboard/maestros/lugares-ventas',
    icon: '🚛',
  },
];

/**
 * Memoized MaestroCard component to prevent unnecessary re-renders.
 */
const MaestroCard = memo(function MaestroCard({ card }: { card: MaestroCard }): JSX.Element {
  return (
    <Link
      href={card.href}
      className="
        flex flex-col gap-3 rounded-lg border border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800 p-5 shadow-sm
        hover:border-blue-300 dark:hover:border-blue-500
        hover:shadow-md transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
      "
    >
      <span className="text-3xl" role="img" aria-label={card.title}>
        {card.icon}
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {card.title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {card.description}
        </p>
      </div>
      <span className="mt-auto text-xs font-medium text-blue-600 dark:text-blue-400">
        Gestionar →
      </span>
    </Link>
  );
});

export default function MaestrosPage(): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Maestros
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gestiona los catálogos y tablas maestras de tu operación ganadera
        </p>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {MAESTROS_CARDS.map((card) => (
          <MaestroCard key={card.href} card={card} />
        ))}
      </div>
    </div>
  );
}
