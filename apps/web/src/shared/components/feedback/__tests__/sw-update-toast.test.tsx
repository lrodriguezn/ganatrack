// apps/web/src/shared/components/feedback/__tests__/sw-update-toast.test.tsx
/**
 * Tests for SWUpdateToast component.
 *
 * Coverage targets:
 * - Shows toast when SW update is available
 * - Calls skipWaiting on reload click
 * - Tracks dismissal count (max 3)
 * - Does not show after max dismissals
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { SWUpdateToast } from '../sw-update-toast';

// Mock sonner toast — must use vi.hoisted for variables referenced in vi.mock
const mockToast = vi.hoisted(() => vi.fn());
const mockDismiss = vi.hoisted(() => vi.fn());

vi.mock('sonner', () => ({
  toast: Object.assign(mockToast, { dismiss: mockDismiss }),
}));

// Mock navigator.serviceWorker
const mockPostMessage = vi.fn();
const mockController = {
  postMessage: mockPostMessage,
};

const mockRegistration = {
  installing: null as ServiceWorker | null,
  waiting: null as ServiceWorker | null,
};

const swEventListeners: Record<string, EventListener[]> = {};

Object.defineProperty(globalThis, 'navigator', {
  value: {
    serviceWorker: {
      controller: mockController,
      ready: Promise.resolve(mockRegistration),
      addEventListener: vi.fn((event: string, handler: EventListener) => {
        if (!swEventListeners[event]) swEventListeners[event] = [];
        swEventListeners[event].push(handler);
      }),
      removeEventListener: vi.fn((event: string, handler: EventListener) => {
        if (swEventListeners[event]) {
          const idx = swEventListeners[event].indexOf(handler);
          if (idx >= 0) swEventListeners[event].splice(idx, 1);
        }
      }),
    },
  },
  writable: true,
  configurable: true,
});

describe('SWUpdateToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockRegistration.installing = null;
    mockRegistration.waiting = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('no debería mostrar toast si no hay actualización', () => {
    render(<SWUpdateToast />);
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('debería mostrar toast cuando hay un SW esperando', async () => {
    const mockWaitingWorker = {
      state: 'installed',
      addEventListener: vi.fn(),
    } as unknown as ServiceWorker;

    mockRegistration.waiting = mockWaitingWorker;

    render(<SWUpdateToast />);

    // Trigger updatefound-like behavior via useEffect
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalled();
    });

    const toastCall = mockToast.mock.calls[0];
    expect(toastCall[0]).toContain('Nueva versión disponible');
  });

  it('debería llamar skipWaiting al hacer click en recargar', async () => {
    const mockWaitingWorker = {
      state: 'installed',
      addEventListener: vi.fn(),
    } as unknown as ServiceWorker;

    mockRegistration.waiting = mockWaitingWorker;

    render(<SWUpdateToast />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalled();
    });

    // Extract the action callback from toast call
    const toastCall = mockToast.mock.calls[0];
    const options = toastCall[1] as { action?: { label: string; onClick: () => void } };
    expect(options.action).toBeDefined();
    expect(options.action?.label).toBe('Recargar');

    // Click the action
    options.action?.onClick();

    expect(mockPostMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  });

  it('debería incrementar contador de descartes al cerrar toast', async () => {
    const mockWaitingWorker = {
      state: 'installed',
      addEventListener: vi.fn(),
    } as unknown as ServiceWorker;

    mockRegistration.waiting = mockWaitingWorker;

    render(<SWUpdateToast />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalled();
    });

    // Simulate toast dismissal by calling onDismiss
    const toastCall = mockToast.mock.calls[0];
    const options = toastCall[1] as { onDismiss?: () => void };
    options.onDismiss?.();

    expect(localStorage.getItem('ganatrack-sw-dismiss-count')).toBe('1');
  });

  it('no debería mostrar toast después de 3 descartes', () => {
    localStorage.setItem('ganatrack-sw-dismiss-count', '3');

    const mockWaitingWorker = {
      state: 'installed',
      addEventListener: vi.fn(),
    } as unknown as ServiceWorker;

    mockRegistration.waiting = mockWaitingWorker;

    render(<SWUpdateToast />);

    // Should not show toast after max dismissals
    expect(mockToast).not.toHaveBeenCalled();
  });
});
