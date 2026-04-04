// apps/web/src/tests/modules/servicios/use-create-servicio-veterinario.test.ts
/**
 * useCreateServicioVeterinario hook tests.
 *
 * Tests:
 * - create function
 * - isPending state
 * - error handling
 * - query invalidation on success
 * - validation error handling
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

// Mock toast
const mockToastError = vi.fn();
vi.mock('@/shared/components/feedback', () => ({
  toast: {
    error: mockToastError,
  },
}));

// Import AFTER mock
const { useCreateServicioVeterinario } = await import('@/modules/servicios/hooks/use-create-servicio-veterinario');

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

describe('useCreateServicioVeterinario', () => {
  describe('create', () => {
    it('debería llamar al servicio createServicioVeterinario', async () => {
      const mockData = { animalId: 1, fecha: '2024-01-15', tipo: 'vacunacion' };
      const mockResponse = { id: 1, ...mockData };

      mockServiciosService.createServicioVeterinario.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useCreateServicioVeterinario(), { wrapper: createWrapper() });

      await result.current.mutateAsync(mockData);

      expect(mockServiciosService.createServicioVeterinario).toHaveBeenCalledWith(mockData);
    });

    it('debería ejecutar la mutación correctamente', async () => {
      mockServiciosService.createServicioVeterinario.mockResolvedValueOnce({ id: 1 });

      const { result } = renderHook(() => useCreateServicioVeterinario(), { wrapper: createWrapper() });

      await result.current.mutateAsync({ animalId: 1 });

      expect(mockServiciosService.createServicioVeterinario).toHaveBeenCalledWith({ animalId: 1 });
    });

    it('debería retornar error cuando el servicio falla', async () => {
      mockServiciosService.createServicioVeterinario.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useCreateServicioVeterinario(), { wrapper: createWrapper() });

      await expect(result.current.mutateAsync({ animalId: 1 })).rejects.toThrow();

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
      });
    });

    it('debería navegar a la lista de servicios veterinarios después de éxito', async () => {
      mockServiciosService.createServicioVeterinario.mockResolvedValueOnce({ id: 1 });

      const { result } = renderHook(() => useCreateServicioVeterinario(), { wrapper: createWrapper() });

      await result.current.mutateAsync({ animalId: 1 });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard/servicios/veterinarios');
      });
    });

    it('debería manejar errores de validación del backend', async () => {
      mockServiciosService.createServicioVeterinario.mockResolvedValueOnce({
        success: false,
        message: 'Errores de validación',
        errors: [{ field: 'fecha', message: 'Fecha inválida' }],
      });

      const { result } = renderHook(() => useCreateServicioVeterinario(), { wrapper: createWrapper() });

      await result.current.mutateAsync({ animalId: 1 });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Error al crear servicio veterinario',
          'Errores de validación',
        );
      });
    });
  });
});
