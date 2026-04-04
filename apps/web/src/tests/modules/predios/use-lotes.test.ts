// apps/web/src/tests/modules/predios/use-lotes.test.ts
/**
 * useLotes hook tests.
 *
 * Tests:
 * - returns lotes list and loading states
 * - enabled only when predioId > 0
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
const { useLotes } = await import('@/modules/predios/hooks/use-lotes');

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

describe('useLotes', () => {
  describe('basic usage', () => {
    it('should return lotes and loading states', async () => {
      const mockData = [
        { id: 1, nombre: 'Lote 1' },
        { id: 2, nombre: 'Lote 2' },
      ];

      mockPrediosService.getLotes.mockResolvedValueOnce(mockData);

      const { result } = renderHook(
        () => useLotes({ predioId: 1 }),
        { wrapper: createWrapper() },
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.lotes).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('should return error when service fails', async () => {
      mockPrediosService.getLotes.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(
        () => useLotes({ predioId: 1 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('enabled state', () => {
    it('should not run when predioId is 0', async () => {
      renderHook(
        () => useLotes({ predioId: 0 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockPrediosService.getLotes).not.toHaveBeenCalled();
      });
    });

    it('should run when predioId is greater than 0', async () => {
      const mockData = [{ id: 1, nombre: 'Lote 1' }];
      mockPrediosService.getLotes.mockResolvedValueOnce(mockData);

      renderHook(
        () => useLotes({ predioId: 1 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockPrediosService.getLotes).toHaveBeenCalledWith(1);
      });
    });
  });
});
