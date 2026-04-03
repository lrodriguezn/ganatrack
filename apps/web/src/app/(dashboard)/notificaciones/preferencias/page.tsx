// apps/web/src/app/(dashboard)/notificaciones/preferencias/page.tsx
/**
 * Notificaciones Preferencias page.
 *
 * Renders the PreferenciasForm component with push registration integration.
 */

import { PreferenciasForm } from "@/modules/notificaciones/components/preferencias-form";

export default function PreferenciasPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Preferencias de notificaciones
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configura qué notificaciones quieres recibir y por qué canal
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <PreferenciasForm />
      </div>
    </div>
  );
}
