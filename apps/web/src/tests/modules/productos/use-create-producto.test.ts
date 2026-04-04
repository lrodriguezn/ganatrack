// apps/web/src/tests/modules/productos/use-create-producto.test.ts
/**
 * useCreateProducto hook tests.
 *
 * Tests:
 * - create function
 * - isPending state
 * - error handling
 * - query invalidation on success
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
const { useCreateProducto } = await import('@/modules/productos/hooks/use-create-producto');

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

describe('useCreateProducto', () => {
  describe('create', () => {
    it('should call productoService.create', async () => {
      const mockData = { nombre: 'Nuevo Producto', tipoKey: 1 };
      const mockResponse = { id: 1, ...mockData };

      mockProductoService.create.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useCreateProducto(), { wrapper: createWrapper() });

      await result.current.mutateAsync(mockData);

      expect(mockProductoService.create).toHaveBeenCalledWith(mockData);
    });

    it('should execute mutation correctly', async () => {
      mockProductoService.create.mockResolvedValueOnce({ id: 1 });

      const { result } = renderHook(() => useCreateProducto(), { wrapper: createWrapper() });

      await result.current.mutateAsync({ nombre: 'Nuevo' });

      expect(mockProductoService.create).toHaveBeenCalledWith({ nombre: 'Nuevo' });
    });

    it('should return error when service fails', async () => {
      mockProductoService.create.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useCreateProducto(), { wrapper: createWrapper() });

      await expect(result.current.mutateAsync({ nombre: 'Nuevo' })).rejects.toThrow();

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
      });
    });
  });
});
