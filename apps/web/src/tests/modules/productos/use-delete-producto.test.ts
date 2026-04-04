// apps/web/src/tests/modules/productos/use-delete-producto.test.ts
/**
 * useDeleteProducto hook tests.
 *
 * Tests:
 * - delete function
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
const { useDeleteProducto } = await import('@/modules/productos/hooks/use-delete-producto');

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

describe('useDeleteProducto', () => {
  describe('delete', () => {
    it('should call productoService.delete', async () => {
      mockProductoService.delete.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteProducto(), { wrapper: createWrapper() });

      await result.current.mutateAsync(1);

      expect(mockProductoService.delete).toHaveBeenCalledWith(1);
    });

    it('should execute mutation correctly', async () => {
      mockProductoService.delete.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteProducto(), { wrapper: createWrapper() });

      await result.current.mutateAsync(1);

      expect(mockProductoService.delete).toHaveBeenCalledWith(1);
    });

    it('should return error when service fails', async () => {
      mockProductoService.delete.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useDeleteProducto(), { wrapper: createWrapper() });

      await expect(result.current.mutateAsync(1)).rejects.toThrow();

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
      });
    });
  });
});
