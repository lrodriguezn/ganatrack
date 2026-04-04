// apps/web/src/tests/modules/servicios/use-servicio-veterinario.test.ts
/**
 * useServicioVeterinario hook tests.
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

// Import AFTER mock
const { useServicioVeterinario } = await import('@/modules/servicios/hooks/use-servicio-veterinario');

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

describe('useServicioVeterinario', () => {
  describe('basic usage', () => {
    it('debería retornar data y estados de carga', async () => {
      const mockData = {
        id: 1,
        animalId: 1,
        fecha: '2024-01-15',
        tipo: 'vacunacion',
        observaciones: 'Test',
      };

      mockServiciosService.getServicioVeterinarioById.mockResolvedValueOnce(mockData);

      const { result } = renderHook(
        () => useServicioVeterinario(1),
        { wrapper: createWrapper() },
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it('debería retornar error cuando el servicio falla', async () => {
      mockServiciosService.getServicioVeterinarioById.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(
        () => useServicioVeterinario(1),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('enabled state', () => {
    it('no debería ejecutarse cuando id es 0', async () => {
      renderHook(
        () => useServicioVeterinario(0),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockServiciosService.getServicioVeterinarioById).not.toHaveBeenCalled();
      });
    });

    it('debería ejecutarse cuando id es mayor a 0', async () => {
      const mockData = { id: 1, animalId: 1 };
      mockServiciosService.getServicioVeterinarioById.mockResolvedValueOnce(mockData);

      renderHook(
        () => useServicioVeterinario(1),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(mockServiciosService.getServicioVeterinarioById).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('refetch', () => {
    it('debería proveer función de refetch', async () => {
      const mockData = { id: 1, animalId: 1 };
      mockServiciosService.getServicioVeterinarioById.mockResolvedValueOnce(mockData);

      const { result } = renderHook(
        () => useServicioVeterinario(1),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });
});
