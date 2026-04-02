// apps/web/src/shared/components/layout/sitio-selector.tsx
/**
 * SitioSelector — header dropdown for switching between predios.
 *
 * Behavior:
 * - predios.length === 0: renders nothing (user hasn't loaded predios yet)
 * - predios.length === 1: renders as plain <span> with active predio name
 * - predios.length > 1: renders Radix DropdownMenu with all predios
 *
 * Switching calls switchPredio(id) which updates lastSwitchTimestamp.
 */

'use client';

import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { usePredioStore } from '@/store/predio.store';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/dropdown-menu';

export function SitioSelector(): JSX.Element | null {
  const predios = usePredioStore((s) => s.predios);
  const activo = usePredioStore((s) => s.predioActivo);
  const switchPredio = usePredioStore((s) => s.switchPredio);

  // User hasn't loaded predios yet
  if (predios.length === 0) {
    return null;
  }

  // Single predio — plain text, no dropdown
  if (predios.length === 1) {
    const singlePredio = predios[0]!;
    return (
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {activo?.nombre ?? singlePredio.nombre}
      </span>
    );
  }

  // Multiple predios — dropdown selector
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
        <span>{activo?.nombre ?? 'Seleccionar predio'}</span>
        <ChevronDownIcon className="h-4 w-4 text-gray-500" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[200px]">
        {predios.map((predio) => (
          <DropdownMenuItem
            key={predio.id}
            onClick={() => switchPredio(predio.id)}
            className="flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span className="font-medium">{predio.nombre}</span>
              {predio.municipio && (
                <span className="text-xs text-gray-500">{predio.municipio}</span>
              )}
            </div>
            {activo?.id === predio.id && (
              <CheckIcon className="h-4 w-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
