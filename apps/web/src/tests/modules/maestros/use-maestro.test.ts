// apps/web/src/tests/modules/maestros/use-maestro.test.ts
/**
 * Tests for useMaestro hook.
 *
 * Uses real MockMaestrosService injected via vi.mock.
 * Wraps hook with QueryClientProvider.
 *
 * Covers:
 * - Returns items on successful query
 * - Loading state is true initially
 * - Error state when service fails
 * - Mutations (create, remove) update the list
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { MockMaestrosService, resetMaestrosMock } from '@/modules/maestros/services/maestros.mock';

// ============================================================================
// Mock the service module to avoid env-var factory resolution
// ============================================================================

const mockService = new MockMaestrosService();

vi.mock('@/modules/maestros/services/maestros.service', () => ({
  maestrosService: mockService,
}));

// ============================================================================
// Setup
// ============================================================================

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
  resetMaestrosMock();
  vi.clearAllMocks();
});

// ============================================================================
// Import hook AFTER mock is set up
// ============================================================================

const { useMaestro } = await import('@/modules/maestros/hooks/use-maestro');

// ============================================================================
// Tests: items on success
// ============================================================================

describe('useMaestro — items on success', () => {
  it('debería retornar items de veterinarios', async () => {
    const { result } = renderHook(() => useMaestro('veterinarios'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(Array.isArray(result.current.items)).toBe(true);
    expect(result.current.items.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  it('debería retornar items de propietarios', async () => {
    const { result } = renderHook(() => useMaestro('propietarios'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items.length).toBeGreaterThan(0);
  });

  it.each([
    'veterinarios',
    'propietarios',
    'hierros',
    'diagnosticos',
    'motivos-ventas',
    'causas-muerte',
    'lugares-compras',
    'lugares-ventas',
  ] as const)('debería retornar items para tipo "%s"', async (tipo) => {
    const { result } = renderHook(() => useMaestro(tipo), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(Array.isArray(result.current.items)).toBe(true);
    expect(result.current.items.length).toBeGreaterThan(0);
  });

  it('debería retornar array vacío antes de resolver', () => {
    const { result } = renderHook(() => useMaestro('veterinarios'), {
      wrapper: createWrapper(),
    });

    // Before data resolves, items defaults to []
    expect(result.current.items).toEqual([]);
  });
});

// ============================================================================
// Tests: loading state
// ============================================================================

describe('useMaestro — loading state', () => {
  it('debería tener isLoading=true inicialmente', () => {
    const { result } = renderHook(() => useMaestro('diagnosticos'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('debería tener isLoading=false después de resolver', async () => {
    const { result } = renderHook(() => useMaestro('diagnosticos'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});

// ============================================================================
// Tests: error state
// ============================================================================

describe('useMaestro — error state', () => {
  it('debería retornar error cuando el servicio falla', async () => {
    vi.spyOn(mockService, 'getAll').mockRejectedValueOnce(new Error('Error de red'));

    const { result } = renderHook(() => useMaestro('veterinarios'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe('Error de red');
  });
});

// ============================================================================
// Tests: mutation helpers
// ============================================================================

describe('useMaestro — mutation helpers', () => {
  it('debería exponer create, update, remove como funciones', () => {
    const { result } = renderHook(() => useMaestro('hierros'), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.create).toBe('function');
    expect(typeof result.current.update).toBe('function');
    expect(typeof result.current.remove).toBe('function');
  });

  it('debería crear un item y actualizar la lista', async () => {
    const { result } = renderHook(() => useMaestro('motivos-ventas'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const initialCount = result.current.items.length;

    await act(async () => {
      await result.current.create({ nombre: 'Nuevo Motivo Test' });
    });

    await waitFor(() => expect(result.current.items.length).toBe(initialCount + 1));
  });

  it('debería eliminar un item y actualizar la lista', async () => {
    const { result } = renderHook(() => useMaestro('causas-muerte'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const initialCount = result.current.items.length;
    const firstId = result.current.items[0].id;

    await act(async () => {
      await result.current.remove(firstId);
    });

    await waitFor(() => expect(result.current.items.length).toBe(initialCount - 1));
  });
});
