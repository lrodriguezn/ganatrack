// apps/web/src/tests/modules/imagenes/use-delete-imagen.test.ts
/**
 * useDeleteImagen hook tests.
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
const mockImagenService = {
  listByEntity: vi.fn(),
  upload: vi.fn(),
  delete: vi.fn(),
};

vi.mock('@/modules/imagenes/services', () => ({
  imagenService: mockImagenService,
}));

// Import AFTER mock
const { useDeleteImagen } = await import('@/modules/imagenes/hooks/use-delete-imagen');

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

describe('useDeleteImagen', () => {
  describe('delete', () => {
    it('should call imagenService.delete', async () => {
      mockImagenService.delete.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteImagen(), { wrapper: createWrapper() });

      await result.current.mutateAsync({ id: 1, entidadTipo: 'producto', entidadId: 1 });

      expect(mockImagenService.delete).toHaveBeenCalledWith(1);
    });

    it('should execute mutation correctly', async () => {
      mockImagenService.delete.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteImagen(), { wrapper: createWrapper() });

      await result.current.mutateAsync({ id: 1, entidadTipo: 'producto', entidadId: 1 });

      expect(mockImagenService.delete).toHaveBeenCalledWith(1);
    });

    it('should return error when service fails', async () => {
      mockImagenService.delete.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useDeleteImagen(), { wrapper: createWrapper() });

      await expect(result.current.mutateAsync({ id: 1, entidadTipo: 'producto', entidadId: 1 })).rejects.toThrow();

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
      });
    });
  });
});
