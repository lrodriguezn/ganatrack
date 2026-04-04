// apps/web/src/tests/modules/productos/use-productos.test.ts
/**
 * useProductos hook tests.
 *
 * Tests:
 * - returns data and loading states
 * - filters passed correctly
 * - refetch function available
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the service
const mockProductoService = {
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock('@/modules/productos/services', () => ({
  productoService: mockProductoService,
}));

// Import AFTER mock
const { useProductos } = await import('@/modules/productos/hooks/use-productos');

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

describe('useProductos', () => {
  describe('basic usage', () => {
    it('should return data and loading states', async () => {
      const mockData = {
        data: [
          { id: 1, nombre: 'Producto 1', tipoKey: 1 },
          { id: 2, nombre: 'Producto 2', tipoKey: 2 },
        ],
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      };

      mockProductoService.getAll.mockResolvedValueOnce(mockData);

      const { result } = renderHook(
        () => useProductos({ predioId: 1, page: 1, limit: 10 }),
        { wrapper: createWrapper() },
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('should return error when service fails', async () => {
      mockProductoService.getAll.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(
        () => useProductos({ predioId: 1, page: 1, limit: 10 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('filters', () => {
    it('should pass filters to service', async () => {
      const mockData = { data: [], page: 1, limit: 10, total: 0, totalPages: 0 };
      mockProductoService.getAll.mockResolvedValueOnce(mockData);

      renderHook(
        () => useProductos({ predioId: 1, page: 1, limit: 10, tipoKey: 1 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockProductoService.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ predioId: 1, tipoKey: 1 }),
        );
      });
    });
  });

  describe('refetch', () => {
    it('should provide refetch function', async () => {
      const mockData = { data: [], page: 1, limit: 10, total: 0, totalPages: 0 };
      mockProductoService.getAll.mockResolvedValueOnce(mockData);

      const { result } = renderHook(
        () => useProductos({ predioId: 1, page: 1, limit: 10 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });
});
