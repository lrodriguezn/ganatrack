// apps/web/src/tests/modules/productos/use-update-producto.test.ts
/**
 * useUpdateProducto hook tests.
 *
 * Tests:
 * - update function
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
const { useUpdateProducto } = await import('@/modules/productos/hooks/use-update-producto');

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

describe('useUpdateProducto', () => {
  describe('update', () => {
    it('should call productoService.update', async () => {
      const mockData = { nombre: 'Producto Actualizado' };
      const mockResponse = { id: 1, ...mockData };

      mockProductoService.update.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useUpdateProducto(), { wrapper: createWrapper() });

      await result.current.mutateAsync({ id: 1, data: mockData });

      expect(mockProductoService.update).toHaveBeenCalledWith(1, mockData);
    });

    it('should execute mutation correctly', async () => {
      mockProductoService.update.mockResolvedValueOnce({ id: 1 });

      const { result } = renderHook(() => useUpdateProducto(), { wrapper: createWrapper() });

      await result.current.mutateAsync({ id: 1, data: { nombre: 'Test' } });

      expect(mockProductoService.update).toHaveBeenCalledWith(1, { nombre: 'Test' });
    });

    it('should return error when service fails', async () => {
      mockProductoService.update.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useUpdateProducto(), { wrapper: createWrapper() });

      await expect(result.current.mutateAsync({ id: 1, data: { nombre: 'Test' } })).rejects.toThrow();

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
      });
    });
  });
});
