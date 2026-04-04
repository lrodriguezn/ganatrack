// apps/web/src/tests/modules/predios/use-predio.test.ts
/**
 * usePredio hook tests.
 *
 * Tests:
 * - returns single Predio and loading states
 * - enabled only when id > 0
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
const { usePredio } = await import('@/modules/predios/hooks/use-predio');

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

describe('usePredio', () => {
  describe('basic usage', () => {
    it('debería retornar Predio y estados de carga', async () => {
      const mockData = { id: 1, nombre: 'Predio 1', tipo: 'ganadero' };

      mockPrediosService.getPredio.mockResolvedValueOnce(mockData);

      const { result } = renderHook(
        () => usePredio({ id: 1 }),
        { wrapper: createWrapper() },
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.predio).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('debería retornar error cuando el servicio falla', async () => {
      mockPrediosService.getPredio.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(
        () => usePredio({ id: 1 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('enabled state', () => {
    it('no debería ejecutarse cuando id es 0', async () => {
      renderHook(
        () => usePredio({ id: 0 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockPrediosService.getPredio).not.toHaveBeenCalled();
      });
    });

    it('debería ejecutarse cuando id es mayor a 0', async () => {
      const mockData = { id: 1, nombre: 'Predio 1' };
      mockPrediosService.getPredio.mockResolvedValueOnce(mockData);

      renderHook(
        () => usePredio({ id: 1 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockPrediosService.getPredio).toHaveBeenCalledWith(1);
      });
    });
  });
});
