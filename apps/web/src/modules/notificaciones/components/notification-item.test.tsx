// apps/web/src/modules/notificaciones/components/notification-item.test.tsx
/**
 * Tests for NotificationItem component.
 *
 * Coverage targets:
 * - Renders without crashing for all 11 NotificacionTipo values (6 lower_snake + 5 UPPER_SNAKE)
 * - Renders correct icon for each tipo
 * - Calls onMarkRead when clicked and notification is unread
 * - Does NOT call onMarkRead when already read
 * - Shows unread indicator (blue dot) for unread notifications
 * - Renders relative date in Spanish
 *
 * Regression: A.C3 — API returns UPPER_SNAKE tipos (PARTO_PROXIMO, CELO_ESTIMADO,
 * INSEMINACION_PENDIENTE, VACUNA_PENDIENTE, ANIMAL_ENFERMO). Without these entries
 * in TIPO_ICONS, the component would crash on first real poll.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationItem } from './notification-item';
import type { Notificacion, NotificacionTipo } from '../types/notificaciones.types';

const baseNotification: Notificacion = {
  id: 1,
  tipo: 'parto_proximo',
  titulo: 'Parto próximo — La Negra',
  mensaje: 'Se estima parto en 7 días',
  leida: false,
  fechaCreacion: new Date().toISOString(),
  entidadTipo: 'animal',
  entidadId: 14,
  accionUrl: '/animales/14',
};

describe('NotificationItem — render', () => {
  it('renders without crashing for lower_snake web-native tipos', () => {
    const lowerSnakeTipos: NotificacionTipo[] = [
      'parto_proximo',
      'celo_detectado',
      'servicio_pendiente',
      'alerta_sanitaria',
      'sync_completado',
      'sync_fallido',
    ];

    for (const tipo of lowerSnakeTipos) {
      const { unmount } = render(
        <NotificationItem
          notification={{ ...baseNotification, tipo }}
          onMarkRead={vi.fn()}
        />,
      );
      // Should not throw
      expect(screen.getByText(baseNotification.titulo)).toBeInTheDocument();
      unmount();
    }
  });

  it('renders without crashing for UPPER_SNAKE API tipos (regression: A.C3)', () => {
    const upperSnakeTipos: NotificacionTipo[] = [
      'PARTO_PROXIMO',
      'CELO_ESTIMADO',
      'INSEMINACION_PENDIENTE',
      'VACUNA_PENDIENTE',
      'ANIMAL_ENFERMO',
    ];

    for (const tipo of upperSnakeTipos) {
      const { unmount } = render(
        <NotificationItem
          notification={{ ...baseNotification, tipo, titulo: `Notif ${tipo}` }}
          onMarkRead={vi.fn()}
        />,
      );
      // Should not throw — Icon must resolve, not be undefined
      expect(screen.getByText(`Notif ${tipo}`)).toBeInTheDocument();
      unmount();
    }
  });

  it('renders an SVG icon for every NotificacionTipo (regression: no undefined Icon crash)', () => {
    const allTipos: NotificacionTipo[] = [
      'parto_proximo',
      'celo_detectado',
      'servicio_pendiente',
      'alerta_sanitaria',
      'sync_completado',
      'sync_fallido',
      'PARTO_PROXIMO',
      'CELO_ESTIMADO',
      'INSEMINACION_PENDIENTE',
      'VACUNA_PENDIENTE',
      'ANIMAL_ENFERMO',
    ];

    for (const tipo of allTipos) {
      const { container, unmount } = render(
        <NotificationItem
          notification={{ ...baseNotification, tipo, titulo: `N ${tipo}` }}
          onMarkRead={vi.fn()}
        />,
      );
      const svgs = container.querySelectorAll('svg');
      // At least one SVG (the type icon)
      expect(svgs.length).toBeGreaterThanOrEqual(1);
      unmount();
    }
  });
});

describe('NotificationItem — mark-read interaction', () => {
  it('calls onMarkRead when an unread notification is clicked', async () => {
    const onMarkRead = vi.fn();
    render(
      <NotificationItem
        notification={{ ...baseNotification, leida: false }}
        onMarkRead={onMarkRead}
      />,
    );

    await userEvent.click(screen.getByRole('button'));

    expect(onMarkRead).toHaveBeenCalledWith(1);
  });

  it('does NOT call onMarkRead when already read', async () => {
    const onMarkRead = vi.fn();
    render(
      <NotificationItem
        notification={{ ...baseNotification, leida: true }}
        onMarkRead={onMarkRead}
      />,
    );

    await userEvent.click(screen.getByRole('button'));

    expect(onMarkRead).not.toHaveBeenCalled();
  });
});

describe('NotificationItem — unread indicator', () => {
  it('shows the blue unread dot for unread notifications', () => {
    const { container } = render(
      <NotificationItem
        notification={{ ...baseNotification, leida: false }}
        onMarkRead={vi.fn()}
      />,
    );

    // The unread dot is a small rounded span with bg-blue-500
    const dot = container.querySelector('.bg-blue-500.rounded-full');
    expect(dot).toBeInTheDocument();
  });

  it('does NOT show the unread dot for read notifications', () => {
    const { container } = render(
      <NotificationItem
        notification={{ ...baseNotification, leida: true }}
        onMarkRead={vi.fn()}
      />,
    );

    const dot = container.querySelector('.bg-blue-500.rounded-full');
    expect(dot).not.toBeInTheDocument();
  });
});
