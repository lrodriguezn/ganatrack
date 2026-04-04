// apps/web/src/tests/modules/imagenes/use-imagenes.test.ts
/**
 * useImagenes hook tests.
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
const mockImagenService = {
  listByEntity: vi.fn(),
  upload: vi.fn(),
  delete: vi.fn(),
};

vi.mock('@/modules/imagenes/services', () => ({
  imagenService: mockImagenService,
}));

// Import AFTER mock
const { useImagenes } = await import('@/modules/imagenes/hooks/use-imagenes');

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

describe('useImagenes', () => {
  describe('basic usage', () => {
    it('should return data and loading states', async () => {
      const mockData = [
        { id: 1, url: 'img1.jpg', entidadTipo: 'producto', entidadId: 1 },
        { id: 2, url: 'img2.jpg', entidadTipo: 'producto', entidadId: 1 },
      ];

      mockImagenService.listByEntity.mockResolvedValueOnce(mockData);

      const { result } = renderHook(
        () => useImagenes({ entidadTipo: 'producto', entidadId: 1 }),
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
      mockImagenService.listByEntity.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(
        () => useImagenes({ entidadTipo: 'producto', entidadId: 1 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('refetch', () => {
    it('should provide refetch function', async () => {
      const mockData = [];
      mockImagenService.listByEntity.mockResolvedValueOnce(mockData);

      const { result } = renderHook(
        () => useImagenes({ entidadTipo: 'producto', entidadId: 1 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });
});
