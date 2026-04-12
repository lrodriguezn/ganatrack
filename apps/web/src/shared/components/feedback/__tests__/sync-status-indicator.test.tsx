// apps/web/src/shared/components/feedback/__tests__/sync-status-indicator.test.tsx
/**
 * Tests for SyncStatusIndicator component.
 *
 * Coverage targets:
 * - Returns null when pendingCount === 0
 * - Shows count for 1-99
 * - Shows "99+" when count > 99
 * - Has correct aria-label
 * - Applies custom className
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

async function renderSyncStatusIndicator(props: Record<string, unknown>) {
  vi.resetModules();
  const { SyncStatusIndicator } = await import('../sync-status-indicator');
  return render(<SyncStatusIndicator {...props} />);
}

describe('SyncStatusIndicator — renderizado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería retornar null cuando pendingCount es 0', async () => {
    const { container } = await renderSyncStatusIndicator({ pendingCount: 0 });

    expect(container.firstChild).toBeNull();
  });

  it('debería mostrar el conteo cuando pendingCount es 1', async () => {
    await renderSyncStatusIndicator({ pendingCount: 1 });

    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('1');
  });

  it('debería mostrar el conteo cuando pendingCount es 50', async () => {
    await renderSyncStatusIndicator({ pendingCount: 50 });

    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('50');
  });

  it('debería mostrar "99+" cuando pendingCount > 99', async () => {
    await renderSyncStatusIndicator({ pendingCount: 150 });

    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('99+');
  });

  it('debería mostrar "99+" cuando pendingCount === 100', async () => {
    await renderSyncStatusIndicator({ pendingCount: 100 });

    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('99+');
  });
});

describe('SyncStatusIndicator — accesibilidad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería tener aria-label con texto descriptivo en singular', async () => {
    await renderSyncStatusIndicator({ pendingCount: 1 });

    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute(
      'aria-label',
      '1 cambios pendientes de sincronización',
    );
  });

  it('debería tener aria-label con texto descriptivo en plural', async () => {
    await renderSyncStatusIndicator({ pendingCount: 5 });

    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute(
      'aria-label',
      '5 cambios pendientes de sincronización',
    );
  });
});

describe('SyncStatusIndicator — estilos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería aplicar colores amber por defecto', async () => {
    await renderSyncStatusIndicator({ pendingCount: 3 });

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('bg-amber-500', 'text-white');
  });

  it('debería aplicar className personalizado', async () => {
    await renderSyncStatusIndicator({ pendingCount: 3, className: 'ml-2' });

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('ml-2');
  });

  it('debería respetar max personalizado', async () => {
    await renderSyncStatusIndicator({ pendingCount: 200, max: 50 });

    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('50+');
  });
});
