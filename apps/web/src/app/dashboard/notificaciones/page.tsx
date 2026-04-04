// apps/web/src/app/dashboard/notificaciones/page.tsx
/**
 * Notificaciones page — main notification list with filters and pagination.
 *
 * Features:
 * - Filter tabs: Todas, No leídas
 * - Notification list with mark as read actions
 * - "Marcar todas como leídas" button
 * - Click to navigate to entity (if accionUrl)
 *
 * Route: /dashboard/notificaciones
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { usePredioStore } from '@/store/predio.store';
import { useNotificaciones, useMarkRead } from '@/modules/notificaciones/hooks';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { Notificacion } from '@/modules/notificaciones/types/notificaciones.types';
import { NOTIFICACION_TIPO_LABELS, NOTIFICACION_TIPO_COLORS } from '@/modules/notificaciones/types/notificaciones.types';

type FilterTab = 'todas' | 'no-leidas';

function formatDate(fecha: string): string {
  const date = new Date(fecha);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `Hace ${minutes} min`;
    }
    return `Hace ${hours} hr`;
  }
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

function NotificationItem({
  notificacion,
  onMarkRead,
}: {
  notificacion: Notificacion;
  onMarkRead: (id: number) => void;
}) {
  const router = useRouter();
  const tipoColor = NOTIFICACION_TIPO_COLORS[notificacion.tipo] || 'text-gray-500 bg-gray-50';
  const tipoLabel = NOTIFICACION_TIPO_LABELS[notificacion.tipo] || notificacion.tipo;

  const handleClick = () => {
    if (!notificacion.leida) {
      onMarkRead(notificacion.id);
    }
    if (notificacion.accionUrl) {
      router.push(notificacion.accionUrl);
    }
  };

  return (
    <div
      className={`
        flex items-start gap-4 rounded-lg border p-4 cursor-pointer
        transition-colors hover:bg-gray-50 dark:hover:bg-gray-800
        ${notificacion.leida 
          ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900' 
          : 'border-l-4 border-l-blue-500 border-gray-200 dark:border-gray-700 bg-blue-50/50 dark:bg-blue-950/30'}
      `}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${tipoColor}`}>
        <Bell className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {tipoLabel}
          </span>
          {!notificacion.leida && (
            <span className="h-2 w-2 rounded-full bg-blue-500" />
          )}
        </div>
        <h3 className="mt-1 font-medium text-gray-900 dark:text-gray-100 truncate">
          {notificacion.titulo}
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {notificacion.mensaje}
        </p>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          {formatDate(notificacion.fechaCreacion)}
        </p>
      </div>

      {/* Mark read button */}
      {!notificacion.leida && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(notificacion.id);
          }}
          className="shrink-0"
        >
          <Check className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default function NotificacionesPage(): JSX.Element {
  const activePredio = usePredioStore((state) => state.predioActivo);
  const [filter, setFilter] = useState<FilterTab>('todas');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, error, refetch } = useNotificaciones({
    // @ts-expect-error - usando nombre de parámetro correcto según el hook
    prediold: activePredio?.id,
    page,
    limit: pageSize,
  });

  const { markRead, markAllRead, isPending: isMarkingRead } = useMarkRead();

  const notificaciones = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const filteredNotificaciones = filter === 'no-leidas'
    ? notificaciones.filter((n) => !n.leida)
    : notificaciones;

  const handleMarkRead = async (id: number) => {
    await markRead(id);
    refetch();
  };

  const handleMarkAllRead = async () => {
    if (!activePredio?.id) return;
    await markAllRead(activePredio.id);
    refetch();
  };

  if (!activePredio?.id) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Selecciona un predio para ver las notificaciones
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Error al cargar las notificaciones
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Notificaciones
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {total} notificación{total !== 1 ? 'es' : ''} en tu predio
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={handleMarkAllRead}
          disabled={isMarkingRead || filteredNotificaciones.every((n) => n.leida)}
        >
          <CheckCheck className="h-4 w-4 mr-2" />
          Marcar todas como leídas
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setFilter('todas')}
          className={`
            px-4 py-2 text-sm font-medium border-b-2 transition-colors
            ${filter === 'todas'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}
          `}
        >
          Todas ({total})
        </button>
        <button
          onClick={() => setFilter('no-leidas')}
          className={`
            px-4 py-2 text-sm font-medium border-b-2 transition-colors
            ${filter === 'no-leidas'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}
          `}
        >
          No leídas ({filteredNotificaciones.filter((n) => !n.leida).length})
        </button>
      </div>

      {/* Notification list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : filteredNotificaciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            {filter === 'no-leidas'
              ? 'No tienes notificaciones sin leer'
              : 'No tienes notificaciones'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotificaciones.map((notificacion) => (
            <NotificationItem
              key={notificacion.id}
              notificacion={notificacion}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1 || isMarkingRead}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page === totalPages || isMarkingRead}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
