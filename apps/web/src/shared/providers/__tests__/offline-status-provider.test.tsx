// apps/web/src/shared/providers/__tests__/offline-status-provider.test.tsx
/**
 * Tests for offline-status-provider.tsx — Offline status context provider.
 *
 * Coverage targets:
 * - Provides isOnline and queueCount to children
 * - Children render correctly within provider
 * - Default values are correct
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';

// Mock idb-keyval before importing provider
vi.mock('idb-keyval', () => ({
  get: vi.fn(async () => []),
  set: vi.fn(async () => {}),
  del: vi.fn(async () => {}),
}));

describe('OfflineStatusProvider', () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  it('debería proveer isOnline=true por defecto', async () => {
    const {
      OfflineStatusProvider,
      useOfflineStatus,
    } = await import('../offline-status-provider');

    function TestChild() {
      const { isOnline } = useOfflineStatus();
      return <div data-testid="online">{isOnline ? 'online' : 'offline'}</div>;
    }

    render(
      <OfflineStatusProvider>
        <TestChild />
      </OfflineStatusProvider>,
    );

    expect(screen.getByTestId('online').textContent).toBe('online');
  });

  it('debería proveer queueCount=0 por defecto', async () => {
    const {
      OfflineStatusProvider,
      useOfflineStatus,
    } = await import('../offline-status-provider');

    function TestChild() {
      const { queueCount } = useOfflineStatus();
      return <div data-testid="count">{queueCount}</div>;
    }

    render(
      <OfflineStatusProvider>
        <TestChild />
      </OfflineStatusProvider>,
    );

    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('debería actualizar isOnline al cambiar conectividad', async () => {
    const {
      OfflineStatusProvider,
      useOfflineStatus,
    } = await import('../offline-status-provider');

    function TestChild() {
      const { isOnline } = useOfflineStatus();
      return <div data-testid="online">{isOnline ? 'online' : 'offline'}</div>;
    }

    render(
      <OfflineStatusProvider>
        <TestChild />
      </OfflineStatusProvider>,
    );

    expect(screen.getByTestId('online').textContent).toBe('online');

    // Simulate going offline
    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('online').textContent).toBe('offline');
    });
  });

  it('debería lanzar error si useOfflineStatus se usa fuera del provider', async () => {
    const { useOfflineStatus } = await import('../offline-status-provider');

    function BadComponent() {
      const status = useOfflineStatus();
      return <div>{status.isOnline ? 'yes' : 'no'}</div>;
    }

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<BadComponent />)).toThrow(
      'useOfflineStatus must be used within an OfflineStatusProvider',
    );

    consoleSpy.mockRestore();
  });
});
