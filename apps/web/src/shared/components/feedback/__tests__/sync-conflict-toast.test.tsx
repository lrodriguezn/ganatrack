// apps/web/src/shared/components/feedback/__tests__/sync-conflict-toast.test.tsx
/**
 * Tests for SyncConflictToast component.
 *
 * Coverage targets:
 * - Renders with conflict count
 * - Resolve button fires callback
 * - Dismiss button fires callback
 * - Spanish labels for singular and plural
 * - Shows warning icon
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

async function renderSyncConflictToast(props: Record<string, unknown>) {
  vi.resetModules();
  const { SyncConflictToast } = await import('../sync-conflict-toast');
  return render(<SyncConflictToast {...props} />);
}

describe('SyncConflictToast — renderizado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar con el conteo de conflictos en singular', async () => {
    await renderSyncConflictToast({
      conflictCount: 1,
      onResolve: vi.fn(),
      onDismiss: vi.fn(),
    });

    expect(
      screen.getByText('1 conflicto de sincronización detectado'),
    ).toBeInTheDocument();
  });

  it('debería renderizar con el conteo de conflictos en plural', async () => {
    await renderSyncConflictToast({
      conflictCount: 5,
      onResolve: vi.fn(),
      onDismiss: vi.fn(),
    });

    expect(
      screen.getByText('5 conflictos de sincronización detectados'),
    ).toBeInTheDocument();
  });

  it('debería mostrar el texto descriptivo de ayuda', async () => {
    await renderSyncConflictToast({
      conflictCount: 2,
      onResolve: vi.fn(),
      onDismiss: vi.fn(),
    });

    expect(
      screen.getByText('Revise los conflictos antes de continuar sincronizando'),
    ).toBeInTheDocument();
  });

  it('debería mostrar el icono de advertencia', async () => {
    await renderSyncConflictToast({
      conflictCount: 1,
      onResolve: vi.fn(),
      onDismiss: vi.fn(),
    });

    // AlertTriangle renders as SVG
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });
});

describe('SyncConflictToast — botones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar el botón Resolver', async () => {
    await renderSyncConflictToast({
      conflictCount: 3,
      onResolve: vi.fn(),
      onDismiss: vi.fn(),
    });

    expect(screen.getByRole('button', { name: 'Resolver' })).toBeInTheDocument();
  });

  it('debería renderizar el botón Descartar', async () => {
    await renderSyncConflictToast({
      conflictCount: 3,
      onResolve: vi.fn(),
      onDismiss: vi.fn(),
    });

    expect(screen.getByRole('button', { name: 'Descartar' })).toBeInTheDocument();
  });
});

describe('SyncConflictToast — interacción', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería llamar onResolve al hacer click en Resolver', async () => {
    const onResolve = vi.fn();
    const user = userEvent.setup();

    await renderSyncConflictToast({
      conflictCount: 2,
      onResolve,
      onDismiss: vi.fn(),
    });

    const button = screen.getByRole('button', { name: 'Resolver' });
    await user.click(button);

    expect(onResolve).toHaveBeenCalledTimes(1);
  });

  it('debería llamar onDismiss al hacer click en Descartar', async () => {
    const onDismiss = vi.fn();
    const user = userEvent.setup();

    await renderSyncConflictToast({
      conflictCount: 2,
      onResolve: vi.fn(),
      onDismiss,
    });

    const button = screen.getByRole('button', { name: 'Descartar' });
    await user.click(button);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
