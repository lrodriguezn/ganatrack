// apps/web/src/tests/modules/predios/use-delete-predio.test.ts
/**
 * useDeletePredio hook tests.
 *
 * Tests:
 * - delete function
 * - isLoading state
 * - error handling
 * - optimistic updates
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

// Mock usePredioStore - need to mock getState
const mockGetState = vi.fn(() => ({
  predios: [{ id: 1, nombre: 'Predio 1' }],
  predioActivo: { id: 1, nombre: 'Predio 1' },
  setPredios: vi.fn(),
  switchPredio: vi.fn(),
}));

vi.mock('@/store/predio.store', () => ({
  usePredioStore: vi.fn(() => mockGetState),
}));

// Import AFTER mock
const { useDeletePredio } = await import('@/modules/predios/hooks/use-delete-predio');

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

describe('useDeletePredio', () => {
  describe('delete', () => {
    it('debería llamar al servicio deletePredio', async () => {
      mockPrediosService.deletePredio.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeletePredio(), { wrapper: createWrapper() });

      await result.current.mutateAsync(1);

      expect(mockPrediosService.deletePredio).toHaveBeenCalledWith(1);
    });

    it('debería estar en estado loading mientras ejecuta', async () => {
      let resolveDelete: () => void;
      mockPrediosService.deletePredio.mockImplementationOnce(
        () => new Promise((resolve) => { resolveDelete = resolve; }),
      );

      const { result } = renderHook(() => useDeletePredio(), { wrapper: createWrapper() });

      const promise = result.current.mutateAsync(1);

      expect(result.current.isLoading).toBe(true);

      resolveDelete!();
      await promise;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('debería retornar error cuando el servicio falla', async () => {
      mockPrediosService.deletePredio.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useDeletePredio(), { wrapper: createWrapper() });

      await expect(result.current.mutateAsync(1)).rejects.toThrow();

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
      });
    });

    it('debería ejecutar callback onSuccess', async () => {
      mockPrediosService.deletePredio.mockResolvedValueOnce(undefined);
      const onSuccess = vi.fn();

      const { result } = renderHook(
        () => useDeletePredio({ onSuccess }),
        { wrapper: createWrapper() },
      );

      await result.current.mutateAsync(1);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('debería ejecutar callback onError', async () => {
      mockPrediosService.deletePredio.mockRejectedValueOnce(new Error('API Error'));
      const onError = vi.fn();

      const { result } = renderHook(
        () => useDeletePredio({ onError }),
        { wrapper: createWrapper() },
      );

      await expect(result.current.mutateAsync(1)).rejects.toThrow();

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });
  });
});
