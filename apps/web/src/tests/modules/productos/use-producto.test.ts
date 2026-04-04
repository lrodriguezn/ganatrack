// apps/web/src/tests/modules/productos/use-producto.test.ts
/**
 * useProducto hook tests.
 *
 * Tests:
 * - returns data and loading states for single record
 * - enabled only when id > 0
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
const { useProducto } = await import('@/modules/productos/hooks/use-producto');

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

describe('useProducto', () => {
  describe('basic usage', () => {
    it('should return data and loading states', async () => {
      const mockData = { id: 1, nombre: 'Producto 1', tipoKey: 1 };

      mockProductoService.getById.mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useProducto(1), { wrapper: createWrapper() });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('should return error when service fails', async () => {
      mockProductoService.getById.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useProducto(1), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('enabled state', () => {
    it('should not run when id is 0', async () => {
      renderHook(() => useProducto(0), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockProductoService.getById).not.toHaveBeenCalled();
      });
    });

    it('should run when id is greater than 0', async () => {
      const mockData = { id: 1, nombre: 'Producto 1' };
      mockProductoService.getById.mockResolvedValueOnce(mockData);

      renderHook(() => useProducto(1), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockProductoService.getById).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('refetch', () => {
    it('should provide refetch function', async () => {
      const mockData = { id: 1, nombre: 'Producto 1' };
      mockProductoService.getById.mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useProducto(1), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });
});
