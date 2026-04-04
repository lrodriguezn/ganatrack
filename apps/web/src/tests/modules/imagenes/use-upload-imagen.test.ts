// apps/web/src/tests/modules/imagenes/use-upload-imagen.test.ts
/**
 * useUploadImagen hook tests.
 *
 * Tests:
 * - uploadFile function
 * - uploadAll function
 * - isUploading state
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
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

// Mock Zustand store
vi.mock('@/store/imagen.store', () => ({
  useImagenStore: vi.fn(() => ({
    queue: [
      { id: '1', file: new File(['test'], 'test.jpg'), status: 'pending' },
    ],
    updateProgress: vi.fn(),
    markComplete: vi.fn(),
    markError: vi.fn(),
    setXhr: vi.fn(),
  })),
}));

// Import AFTER mock
const { useUploadImagen } = await import('@/modules/imagenes/hooks/use-upload-imagen');

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

describe('useUploadImagen', () => {
  describe('uploadFile', () => {
    it('should call imagenService.upload', async () => {
      mockImagenService.upload.mockResolvedValueOnce({ id: 1, url: 'img.jpg' });

      const { result } = renderHook(
        () => useUploadImagen({ entidadTipo: 'producto', entidadId: 1 }),
        { wrapper: createWrapper() },
      );

      await act(async () => {
        await result.current.uploadFile('1');
      });

      expect(mockImagenService.upload).toHaveBeenCalled();
    });
  });

  describe('uploadAll', () => {
    it('should call imagenService.upload for all pending items', async () => {
      mockImagenService.upload.mockResolvedValue({ id: 1, url: 'img.jpg' });

      const { result } = renderHook(
        () => useUploadImagen({ entidadTipo: 'producto', entidadId: 1 }),
        { wrapper: createWrapper() },
      );

      await act(async () => {
        await result.current.uploadAll();
      });

      expect(mockImagenService.upload).toHaveBeenCalled();
    });
  });

  describe('isUploading', () => {
    it('should be false when not uploading', () => {
      const { result } = renderHook(
        () => useUploadImagen({ entidadTipo: 'producto', entidadId: 1 }),
        { wrapper: createWrapper() },
      );

      expect(result.current.isUploading).toBe(false);
    });
  });
});
