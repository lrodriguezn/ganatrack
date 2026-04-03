// apps/web/src/tests/modules/animales/use-animales.test.ts
/**
 * useAnimales hook tests.
 *
 * Tests:
 * - returns data and loading states
 * - pagination params
 * - filters passed correctly
 * - refetch function available
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the service
const mockAnimalService = {
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  cambiarEstado: vi.fn(),
  getGenealogia: vi.fn(),
  getHistorial: vi.fn(),
  getEstadisticas: vi.fn(),
};

vi.mock('@/modules/animales/services', () => ({
  animalService: mockAnimalService,
}));

// Import AFTER mock
const { useAnimales } = await import('@/modules/animales/hooks/use-animales');

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

describe('useAnimales', () => {
  describe('basic usage', () => {
    it('debería retornar data y estados de carga', async () => {
      const mockData = {
        data: [
          { id: 1, codigo: 'GAN-001', nombre: 'Don Toro', sexoKey: 0 },
          { id: 2, codigo: 'GAN-002', nombre: 'La Negra', sexoKey: 1 },
        ],
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      };

      mockAnimalService.getAll.mockResolvedValueOnce(mockData);

      const { result } = renderHook(
        () => useAnimales({ predioId: 1, page: 1, limit: 10 }),
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
      mockAnimalService.getAll.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(
        () => useAnimales({ predioId: 1, page: 1, limit: 10 }),
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

      mockAnimalService.getAll.mockResolvedValueOnce(mockData);

      renderHook(
        () => useAnimales({ predioId: 1, page: 2, limit: 5 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockAnimalService.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ predioId: 1, page: 2, limit: 5 }),
        );
      });
    });
  });

  describe('filters', () => {
    it('debería pasar filtro de búsqueda al servicio', async () => {
      const mockData = { data: [], page: 1, limit: 10, total: 0, totalPages: 0 };
      mockAnimalService.getAll.mockResolvedValueOnce(mockData);

      renderHook(
        () => useAnimales({ predioId: 1, page: 1, limit: 10, search: 'Don' }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockAnimalService.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'Don' }),
        );
      });
    });

    it('debería pasar filtro de sexoKey al servicio', async () => {
      const mockData = { data: [], page: 1, limit: 10, total: 0, totalPages: 0 };
      mockAnimalService.getAll.mockResolvedValueOnce(mockData);

      renderHook(
        () => useAnimales({ predioId: 1, page: 1, limit: 10, sexoKey: 0 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockAnimalService.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ sexoKey: 0 }),
        );
      });
    });
  });

  describe('refetch', () => {
    it('debería proveer función de refetch', async () => {
      const mockData = { data: [], page: 1, limit: 10, total: 0, totalPages: 0 };
      mockAnimalService.getAll.mockResolvedValueOnce(mockData);

      const { result } = renderHook(
        () => useAnimales({ predioId: 1, page: 1, limit: 10 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });
});
