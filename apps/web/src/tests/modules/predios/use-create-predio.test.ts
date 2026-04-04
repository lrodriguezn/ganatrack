// apps/web/src/tests/modules/predios/use-create-predio.test.ts
/**
 * useCreatePredio hook tests.
 *
 * Tests:
 * - create function
 * - error handling
 * - store sync
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

// Mock usePredioStore with getState() support
const mockSetPredios = vi.fn();
const mockPredios: any[] = [];

const mockStore = {
  predios: mockPredios,
  predioActivo: null,
  setPredios: mockSetPredios,
  switchPredio: vi.fn(),
};

vi.mock('@/store/predio.store', () => ({
  usePredioStore: Object.assign(
    vi.fn((selector) => {
      if (typeof selector === 'function') {
        return selector(mockStore);
      }
      return mockStore;
    }),
    {
      getState: () => mockStore,
    }
  ),
}));

// Import AFTER mock
const { useCreatePredio } = await import('@/modules/predios/hooks/use-create-predio');

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
  mockStore.predios = [];
});

describe('useCreatePredio', () => {
  describe('create', () => {
    it('debería llamar al servicio createPredio', async () => {
      const mockData = { nombre: 'Nuevo Predio', tipo: 'ganadero' as const };
      const mockResponse = { id: 1, nombre: 'Nuevo Predio', tipo: 'ganadero', estado: 'activo' };

      mockPrediosService.createPredio.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useCreatePredio(), { wrapper: createWrapper() });

      await result.current.mutateAsync(mockData);

      expect(mockPrediosService.createPredio).toHaveBeenCalledWith(mockData);
    });

    it('debería retornar error cuando el servicio falla', async () => {
      mockPrediosService.createPredio.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useCreatePredio(), { wrapper: createWrapper() });

      await expect(result.current.mutateAsync({ nombre: 'Nuevo' })).rejects.toThrow();

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
      });
    });

    it('debería sincronizar con el store después de éxito', async () => {
      const mockResponse = { id: 1, nombre: 'Nuevo Predio' };
      mockPrediosService.createPredio.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useCreatePredio(), { wrapper: createWrapper() });

      await result.current.mutateAsync({ nombre: 'Nuevo Predio' });

      await waitFor(() => {
        expect(mockSetPredios).toHaveBeenCalled();
      });
    });

    it('debería ejecutar callback onSuccess', async () => {
      const mockResponse = { id: 1, nombre: 'Nuevo Predio' };
      mockPrediosService.createPredio.mockResolvedValueOnce(mockResponse);
      const onSuccess = vi.fn();

      const { result } = renderHook(
        () => useCreatePredio({ onSuccess }),
        { wrapper: createWrapper() },
      );

      await result.current.mutateAsync({ nombre: 'Nuevo Predio' });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockResponse);
      });
    });

    it('debería ejecutar callback onError', async () => {
      mockPrediosService.createPredio.mockRejectedValueOnce(new Error('API Error'));
      const onError = vi.fn();

      const { result } = renderHook(
        () => useCreatePredio({ onError }),
        { wrapper: createWrapper() },
      );

      try {
        await result.current.mutateAsync({ nombre: 'Nuevo' });
      } catch (e) {
        // Expected
      }

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });
  });
});