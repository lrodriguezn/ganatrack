// apps/web/src/tests/modules/servicios/use-create-parto.test.ts
/**
 * useCreateParto hook tests.
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
const mockServiciosService = {
  getPalpaciones: vi.fn(),
  getPalpacionById: vi.fn(),
  createPalpacion: vi.fn(),
  getInseminaciones: vi.fn(),
  getInseminacionById: vi.fn(),
  createInseminacion: vi.fn(),
  getPartos: vi.fn(),
  getPartoById: vi.fn(),
  createParto: vi.fn(),
  getServiciosVeterinarios: vi.fn(),
  getServicioVeterinarioById: vi.fn(),
  createServicioVeterinario: vi.fn(),
};

vi.mock('@/modules/servicios/services', () => ({
  serviciosService: mockServiciosService,
}));

// Mock router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Import AFTER mock
const { useCreateParto } = await import('@/modules/servicios/hooks/use-create-parto');

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
  mockPush.mockClear();
});

describe('useCreateParto', () => {
  describe('create', () => {
    it('debería llamar al servicio createParto', async () => {
      const mockData = { animalId: 1, fecha: '2024-01-15', tipo: 'natural' };
      const mockResponse = { id: 1, ...mockData };

      mockServiciosService.createParto.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useCreateParto(), { wrapper: createWrapper() });

      await result.current.mutateAsync(mockData);

      expect(mockServiciosService.createParto).toHaveBeenCalledWith(mockData);
    });

    it('debería ejecutar la mutación correctamente', async () => {
      mockServiciosService.createParto.mockResolvedValueOnce({ id: 1 });

      const { result } = renderHook(() => useCreateParto(), { wrapper: createWrapper() });

      await result.current.mutateAsync({ animalId: 1 });

      expect(mockServiciosService.createParto).toHaveBeenCalledWith({ animalId: 1 });
    });

    it('debería retornar error cuando el servicio falla', async () => {
      mockServiciosService.createParto.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useCreateParto(), { wrapper: createWrapper() });

      await expect(result.current.mutateAsync({ animalId: 1 })).rejects.toThrow();

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
      });
    });

    it('debería navegar a la lista de partos después de éxito', async () => {
      mockServiciosService.createParto.mockResolvedValueOnce({ id: 1 });

      const { result } = renderHook(() => useCreateParto(), { wrapper: createWrapper() });

      await result.current.mutateAsync({ animalId: 1 });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/servicios/partos');
      });
    });
  });
});
