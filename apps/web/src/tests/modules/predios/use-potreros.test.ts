// apps/web/src/tests/modules/predios/use-potreros.test.ts
/**
 * usePotreros hook tests.
 *
 * Tests:
 * - returns potreros list and loading states
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
const { usePotreros } = await import('@/modules/predios/hooks/use-potreros');

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

describe('usePotreros', () => {
  describe('basic usage', () => {
    it('should return potreros and loading states', async () => {
      const mockData = [
        { id: 1, nombre: 'Potrero 1', areaHectareas: 10 },
        { id: 2, nombre: 'Potrero 2', areaHectareas: 15 },
      ];

      mockPrediosService.getPotreros.mockResolvedValueOnce(mockData);

      const { result } = renderHook(
        () => usePotreros({ predioId: 1 }),
        { wrapper: createWrapper() },
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.potreros).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('should return error when service fails', async () => {
      mockPrediosService.getPotreros.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(
        () => usePotreros({ predioId: 1 }),
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
        () => usePotreros({ predioId: 0 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockPrediosService.getPotreros).not.toHaveBeenCalled();
      });
    });

    it('should run when predioId is greater than 0', async () => {
      const mockData = [{ id: 1, nombre: 'Potrero 1' }];
      mockPrediosService.getPotreros.mockResolvedValueOnce(mockData);

      renderHook(
        () => usePotreros({ predioId: 1 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockPrediosService.getPotreros).toHaveBeenCalledWith(1);
      });
    });
  });
});
