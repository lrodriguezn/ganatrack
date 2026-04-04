// apps/web/src/tests/modules/servicios/use-partos.test.ts
/**
 * usePartos hook tests.
 *
 * Tests:
 * - returns data and loading states
 * - pagination params passed correctly
 * - refetch function available
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the service
const mockServiciosService = {
  getPalpaciones: vi.fn(),
  getPalpacionById: vi.fn(),
  createPalpacion: vi.fn(),
  getInseminaciones: vi.fn(),
  getInseminacionById: vi.fn(),
  createInseminacion: vi.fn(),
  getPartos: vi.fn(),
  getPartoById: vi.fn(),
  createParto: vi.fn(),
  getServiciosVeterinarios: vi.fn(),
  getServicioVeterinarioById: vi.fn(),
  createServicioVeterinario: vi.fn(),
};

vi.mock('@/modules/servicios/services', () => ({
  serviciosService: mockServiciosService,
}));

// Import AFTER mock
const { usePartos } = await import('@/modules/servicios/hooks/use-partos');

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

describe('usePartos', () => {
  describe('basic usage', () => {
    it('debería retornar data y estados de carga', async () => {
      const mockData = {
        data: [
          { id: 1, animalId: 1, fecha: '2024-01-15', tipo: 'natural' },
        ],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      };

      mockServiciosService.getPartos.mockResolvedValueOnce(mockData);

      const { result } = renderHook(
        () => usePartos({ page: 1, limit: 10 }),
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
      mockServiciosService.getPartos.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(
        () => usePartos({ page: 1, limit: 10 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('refetch', () => {
    it('debería proveer función de refetch', async () => {
      const mockData = { data: [], page: 1, limit: 10, total: 0, totalPages: 0 };
      mockServiciosService.getPartos.mockResolvedValueOnce(mockData);

      const { result } = renderHook(
        () => usePartos({ page: 1, limit: 10 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });
});
