// apps/web/src/modules/notificaciones/components/preferencias-form.tsx
/**
 * PreferenciasForm — notification preferences form.
 *
 * Features:
 * - Channel toggles (in-app, push)
 * - Notification type checkboxes
 * - Optimistic updates with toast confirmation
 * - Push registration integration
 *
 * @example
 * <PreferenciasForm />
 */

'use client';

import { useState } from 'react';
import { useNotificacionPreferencias, usePushRegistration } from '../hooks';

interface PreferenciasFormProps {
  className?: string;
}

export function PreferenciasForm({ className }: PreferenciasFormProps): JSX.Element {
  const { preferencias, isLoading, togglePreferencia, isPending } = useNotificacionPreferencias();
  const { isSupported, permission, requestPermission, isSubscribed, unsubscribe } = usePushRegistration();
  const [showPushPrompt, setShowPushPrompt] = useState(false);

  if (isLoading || !preferencias) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Preferencias de notificaciones
      </h2>

      {/* Notification Types */}
      <fieldset className="mb-8">
        <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Tipos de notificación
        </legend>
        <div className="space-y-3">
          <ToggleRow
            label="Partos próximos"
            description="Notificar cuando un animal esté próximo a parir (7 días)"
            checked={preferencias.partosProximos}
            onToggle={() => togglePreferencia('partosProximos')}
            disabled={isPending}
          />
          <ToggleRow
            label="Celos detectados"
            description="Notificar cuando se detecte celo en una vaca"
            checked={preferencias.celosDetectados}
            onToggle={() => togglePreferencia('celosDetectados')}
            disabled={isPending}
          />
          <ToggleRow
            label="Servicios pendientes"
            description="Recordar palpaciones y servicios programados"
            checked={preferencias.serviciosPendientes}
            onToggle={() => togglePreferencia('serviciosPendientes')}
            disabled={isPending}
          />
          <ToggleRow
            label="Alertas sanitarias"
            description="Vacunaciones y alertas de salud del ganado"
            checked={preferencias.alertasSanitarias}
            onToggle={() => togglePreferencia('alertasSanitarias')}
            disabled={isPending}
          />
        </div>
      </fieldset>

      {/* Push Notifications */}
      <fieldset>
        <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Canal de notificaciones
        </legend>
        <div className="space-y-3">
          <ToggleRow
            label="Notificaciones en la aplicación"
            description="Recibir notificaciones dentro de GanaTrack"
            checked={true}
            onToggle={() => {}}
            disabled
          />

          {/* Push Notifications */}
          {isSupported && (
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Notificaciones push
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Recibir notificaciones incluso con la app cerrada
                </p>
              </div>

              <div className="flex items-center gap-2">
                {permission === 'granted' && isSubscribed ? (
                  <button
                    type="button"
                    onClick={unsubscribe}
                    className="
                      px-3 py-1.5 text-xs font-medium rounded-md
                      bg-red-100 text-red-700 hover:bg-red-200
                      dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50
                      transition-colors
                    "
                  >
                    Desactivar
                  </button>
                ) : permission === 'denied' ? (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Bloqueadas en el navegador
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={requestPermission}
                    className="
                      px-3 py-1.5 text-xs font-medium rounded-md
                      bg-blue-600 text-white hover:bg-blue-700
                      transition-colors
                    "
                  >
                    Activar
                  </button>
                )}
              </div>
            </div>
          )}

          {!isSupported && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tu navegador no soporta notificaciones push
            </p>
          )}
        </div>
      </fieldset>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function ToggleRow({ label, description, checked, onToggle, disabled }: ToggleRowProps): JSX.Element {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={onToggle}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
          border-2 border-transparent transition-colors duration-200 ease-in-out
          ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full
            bg-white shadow ring-0 transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
}
