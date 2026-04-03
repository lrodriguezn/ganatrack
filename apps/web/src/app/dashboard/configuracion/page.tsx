// apps/web/src/app/dashboard/configuracion/page.tsx
/**
 * Configuración overview page — grid of 5 editable catalog cards.
 *
 * Each card links to the corresponding catalog CRUD page.
 */

'use client';

import Link from 'next/link';
import React from 'react';

interface CatalogoCard {
  title: string;
  description: string;
  href: string;
  icon: string;
}

const CONFIG_CARDS: CatalogoCard[] = [
  {
    title: 'Razas',
    description: 'Catálogo de razas de ganado bovino registradas en el sistema',
    href: '/dashboard/configuracion/razas',
    icon: '🐂',
  },
  {
    title: 'Condiciones Corporales',
    description: 'Escala de evaluación del estado corporal del ganado',
    href: '/dashboard/configuracion/condiciones-corporales',
    icon: '📊',
  },
  {
    title: 'Tipos de Explotación',
    description: 'Clasificación de explotaciones ganaderas (ceba, leche, doble propósito)',
    href: '/dashboard/configuracion/tipos-explotacion',
    icon: '🏭',
  },
  {
    title: 'Calidad Animal',
    description: 'Niveles de calidad y conformación del ganado',
    href: '/dashboard/configuracion/calidad-animal',
    icon: '⭐',
  },
  {
    title: 'Colores',
    description: 'Catálogo de colores y pelaje del ganado',
    href: '/dashboard/configuracion/colores',
    icon: '🎨',
  },
];

const CatalogoCard = React.memo(function CatalogoCard({ card }: { card: CatalogoCard }) {
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

export default function ConfiguracionPage(): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Configuración
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Catálogos y parámetros del sistema ganadero
        </p>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {CONFIG_CARDS.map((card) => (
          <CatalogoCard key={card.href} card={card} />
        ))}
      </div>
    </div>
  );
}
