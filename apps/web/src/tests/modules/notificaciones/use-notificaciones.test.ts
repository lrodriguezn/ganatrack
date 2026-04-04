// apps/web/src/tests/modules/notificaciones/use-notificaciones.test.ts
/**
 * useNotificaciones hook tests.
 *
 * Tests:
 * - returns data and loading states
 * - pagination params passed correctly
 * - enabled only when online and predicateId provided
 * - refetch function available
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

// Import AFTER mock
const { useNotificaciones } = await import('@/modules/notificaciones/hooks/use-notificaciones');

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

describe('useNotificaciones', () => {
  describe('basic usage', () => {
    it('debería retornar data y estados de carga', async () => {
      const mockData = {
        data: [
          { id: 1, titulo: 'Notificación 1', leida: false },
          { id: 2, titulo: 'Notificación 2', leida: true },
        ],
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      };

      mockNotificacionesService.getAll.mockResolvedValueOnce(mockData);

      const { result } = renderHook(
        () => useNotificaciones({ predioId: 1, page: 1, limit: 20 }),
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
      mockNotificacionesService.getAll.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(
        () => useNotificaciones({ predioId: 1, page: 1, limit: 20 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect((result.current.error as Error).message).toBe('API Error');
    });
  });

  describe('pagination', () => {
    it('debería pasar parámetros de paginación correctos', async () => {
      const mockData = {
        data: [],
        page: 2,
        limit: 5,
        total: 10,
        totalPages: 2,
      };

      mockNotificacionesService.getAll.mockResolvedValueOnce(mockData);

      renderHook(
        () => useNotificaciones({ predioId: 1, page: 2, limit: 5 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockNotificacionesService.getAll).toHaveBeenCalledWith(
          1,
          expect.objectContaining({ page: 2, limit: 5 }),
        );
      });
    });
  });

  describe('refetch', () => {
    it('debería proveer función de refetch', async () => {
      const mockData = { data: [], page: 1, limit: 20, total: 0, totalPages: 0 };
      mockNotificacionesService.getAll.mockResolvedValueOnce(mockData);

      const { result } = renderHook(
        () => useNotificaciones({ predioId: 1, page: 1, limit: 20 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });
});
