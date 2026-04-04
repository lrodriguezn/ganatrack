// apps/web/src/tests/modules/predios/use-predios.test.ts
/**
 * usePredios hook tests.
 *
 * Tests:
 * - returns predios list and loading states
 * - search filter applied client-side
 * - error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the service
const mockPrediosService = {
  getPredios: vi.fn(),
  getPredio: vi.fn(),
  createPredio: vi.fn(),
  updatePredio: vi.fn(),
  deletePredio: vi.fn(),
  getPotreros: vi.fn(),
  getPotrero: vi.fn(),
  createPotrero: vi.fn(),
  updatePotrero: vi.fn(),
  deletePotrero: vi.fn(),
  getLotes: vi.fn(),
  getLote: vi.fn(),
  createLote: vi.fn(),
  updateLote: vi.fn(),
  deleteLote: vi.fn(),
  getGrupos: vi.fn(),
  getGrupo: vi.fn(),
  createGrupo: vi.fn(),
  updateGrupo: vi.fn(),
  deleteGrupo: vi.fn(),
  getSectores: vi.fn(),
  getSector: vi.fn(),
  createSector: vi.fn(),
  updateSector: vi.fn(),
  deleteSector: vi.fn(),
};

vi.mock('@/modules/predios/services', () => ({
  prediosService: mockPrediosService,
}));

// Import AFTER mock
const { usePredios } = await import('@/modules/predios/hooks/use-predios');

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

describe('usePredios', () => {
  describe('basic usage', () => {
    it('debería retornar predios y estados de carga', async () => {
      const mockData = [
        { id: 1, nombre: 'Predio 1', tipo: 'ganadero' },
        { id: 2, nombre: 'Predio 2', tipo: 'lechería' },
      ];

      mockPrediosService.getPredios.mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => usePredios(), { wrapper: createWrapper() });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.predios).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('debería retornar error cuando el servicio falla', async () => {
      mockPrediosService.getPredios.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => usePredios(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('search filter', () => {
    it('debería aplicar filtro de búsqueda client-side', async () => {
      const mockData = [
        { id: 1, nombre: 'Finca La Esperanza', tipo: 'ganadero' },
        { id: 2, nombre: 'Ganadería San Juan', tipo: 'ganadero' },
      ];

      mockPrediosService.getPredios.mockResolvedValueOnce(mockData);

      const { result } = renderHook(
        () => usePredios({ search: 'esperanza' }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.predios).toBeDefined();
      });

      expect(result.current.predios).toHaveLength(1);
      expect(result.current.predios[0].nombre).toBe('Finca La Esperanza');
    });

    it('debería retornar todos los predios cuando no hay búsqueda', async () => {
      const mockData = [
        { id: 1, nombre: 'Predio 1' },
        { id: 2, nombre: 'Predio 2' },
      ];

      mockPrediosService.getPredios.mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => usePredios({ search: '' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.predios).toHaveLength(2);
      });
    });
  });
});
