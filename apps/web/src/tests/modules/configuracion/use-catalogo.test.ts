// apps/web/src/tests/modules/configuracion/use-catalogo.test.ts
/**
 * Tests for useCatalogo hook.
 *
 * Uses real MockCatalogoService injected via vi.mock.
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
import { MockCatalogoService, resetCatalogoMock } from '@/modules/configuracion/services/catalogo.mock';

// ============================================================================
// Mock the service module to avoid env-var factory resolution
// ============================================================================

const mockService = new MockCatalogoService();

vi.mock('@/modules/configuracion/services/catalogo.service', () => ({
  catalogoService: mockService,
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
  resetCatalogoMock();
  vi.clearAllMocks();
});

// ============================================================================
// Import hook AFTER mock is set up
// ============================================================================

const { useCatalogo } = await import('@/modules/configuracion/hooks/use-catalogo');

// ============================================================================
// Tests: items on success
// ============================================================================

describe('useCatalogo — items on success', () => {
  it('debería retornar items de razas', async () => {
    const { result } = renderHook(() => useCatalogo('razas'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(Array.isArray(result.current.items)).toBe(true);
    expect(result.current.items.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  it('debería retornar items de colores', async () => {
    const { result } = renderHook(() => useCatalogo('colores'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items.length).toBeGreaterThan(0);
  });

  it.each([
    'razas',
    'condiciones-corporales',
    'tipos-explotacion',
    'calidad-animal',
    'colores',
  ] as const)('debería retornar items para tipo "%s"', async (tipo) => {
    const { result } = renderHook(() => useCatalogo(tipo), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(Array.isArray(result.current.items)).toBe(true);
    expect(result.current.items.length).toBeGreaterThan(0);
  });

  it('debería retornar array vacío antes de resolver', () => {
    const { result } = renderHook(() => useCatalogo('razas'), {
      wrapper: createWrapper(),
    });

    // Before data resolves, items defaults to []
    expect(result.current.items).toEqual([]);
  });
});

// ============================================================================
// Tests: loading state
// ============================================================================

describe('useCatalogo — loading state', () => {
  it('debería tener isLoading=true inicialmente', () => {
    const { result } = renderHook(() => useCatalogo('razas'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('debería tener isLoading=false después de resolver', async () => {
    const { result } = renderHook(() => useCatalogo('razas'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});

// ============================================================================
// Tests: error state
// ============================================================================

describe('useCatalogo — error state', () => {
  it('debería retornar error cuando el servicio falla', async () => {
    vi.spyOn(mockService, 'getAll').mockRejectedValueOnce(new Error('Error de red'));

    const { result } = renderHook(() => useCatalogo('razas'), {
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

describe('useCatalogo — mutation helpers', () => {
  it('debería exponer create, update, remove como funciones', () => {
    const { result } = renderHook(() => useCatalogo('razas'), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.create).toBe('function');
    expect(typeof result.current.update).toBe('function');
    expect(typeof result.current.remove).toBe('function');
  });

  it('debería crear un item y actualizar la lista', async () => {
    const { result } = renderHook(() => useCatalogo('colores'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const initialCount = result.current.items.length;

    await act(async () => {
      await result.current.create({ nombre: 'Nuevo Color Test' });
    });

    await waitFor(() => expect(result.current.items.length).toBe(initialCount + 1));
  });

  it('debería eliminar un item y actualizar la lista', async () => {
    const { result } = renderHook(() => useCatalogo('razas'), {
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
