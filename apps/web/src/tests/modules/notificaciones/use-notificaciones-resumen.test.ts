// apps/web/src/tests/modules/notificaciones/use-notificaciones-resumen.test.ts
/**
 * useNotificacionesResumen hook tests.
 *
 * Tests:
 * - returns data and loading states
 * - polling behavior
 * - sync with Zustand store
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the service
const mockNotificacionesService = {
  getResumen: vi.fn(),
  getAll: vi.fn(),
  markRead: vi.fn(),
  markAllRead: vi.fn(),
  delete: vi.fn(),
  getPreferencias: vi.fn(),
  updatePreferencias: vi.fn(),
  subscribePush: vi.fn(),
  unsubscribePush: vi.fn(),
};

vi.mock('@/modules/notificaciones/services', () => ({
  notificacionesService: mockNotificacionesService,
}));

// Mock useOnlineStatus
vi.mock('@/shared/hooks/use-online-status', () => ({
  useOnlineStatus: vi.fn(() => true),
}));

// Mock Zustand store - use selector properly
const mockSetUnreadCount = vi.fn();
vi.mock('@/store/notificaciones.store', () => ({
  useNotificacionesStore: vi.fn(() => mockSetUnreadCount),
}));

// Import AFTER mock
const { useNotificacionesResumen } = await import('@/modules/notificaciones/hooks/use-notificaciones-resumen');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useNotificacionesResumen', () => {
  describe('basic usage', () => {
    it('debería retornar data y estados de carga', async () => {
      const mockData = {
        noLeidas: 5,
        notificaciones: [
          { id: 1, titulo: 'Notificación 1', leida: false },
        ],
      };

      mockNotificacionesService.getResumen.mockResolvedValueOnce(mockData);

      const { result } = renderHook(
        () => useNotificacionesResumen(1),
        { wrapper: createWrapper() },
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('debería retornar error cuando el servicio falla', async () => {
      mockNotificacionesService.getResumen.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(
        () => useNotificacionesResumen(1),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect((result.current.error as Error).message).toBe('API Error');
    });
  });

  describe('store sync', () => {
    it('debería sincronizar unreadCount con el store', async () => {
      const mockData = {
        noLeidas: 3,
        notificaciones: [],
      };

      mockNotificacionesService.getResumen.mockResolvedValueOnce(mockData);

      renderHook(
        () => useNotificacionesResumen(1),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockSetUnreadCount).toHaveBeenCalledWith(3);
      });
    });
  });
});
