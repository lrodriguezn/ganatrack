// apps/web/src/tests/hooks/use-predio-requerido.test.ts
/**
 * Tests for usePredioRequerido hook.
 * Coverage: redirect behavior, loading guard, return value shape.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { Predio } from '@ganatrack/shared-types';

// ============================================================================
// Mocks
// ============================================================================

const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// We will control selector returns via module-level vars
let mockPredioActivo: Predio | null = null;
let mockIsLoading = false;

vi.mock('@/store/predio.store', () => ({
  usePredioStore: (selector: (state: { predioActivo: Predio | null; isLoading: boolean }) => unknown) => {
    const fakeState = { predioActivo: mockPredioActivo, isLoading: mockIsLoading };
    return selector(fakeState);
  },
  selectPredioActivo: (state: { predioActivo: Predio | null }) => state.predioActivo,
  selectIsLoading: (state: { isLoading: boolean }) => state.isLoading,
}));

// ============================================================================
// Fixtures
// ============================================================================

const mockPredio: Predio = {
  id: 1,
  nombre: 'Finca La Esperanza',
  departamento: 'Cundinamarca',
  municipio: 'Guatavita',
  areaHectareas: 120,
  tipo: 'cría',
  estado: 'activo',
};

// ============================================================================
// Tests
// ============================================================================

beforeEach(() => {
  mockReplace.mockClear();
  mockPredioActivo = null;
  mockIsLoading = false;
});

describe('usePredioRequerido', () => {
  it('no debe llamar router.replace cuando isLoading=true y predioActivo=null', async () => {
    mockIsLoading = true;
    mockPredioActivo = null;

    const { usePredioRequerido } = await import('@/shared/hooks/use-predio-requerido');
    renderHook(() => usePredioRequerido());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('debe llamar router.replace("/dashboard/predios") cuando isLoading=false y predioActivo=null', async () => {
    mockIsLoading = false;
    mockPredioActivo = null;

    const { usePredioRequerido } = await import('@/shared/hooks/use-predio-requerido');
    renderHook(() => usePredioRequerido());

    expect(mockReplace).toHaveBeenCalledWith('/dashboard/predios');
  });

  it('no debe llamar router.replace cuando isLoading=false y predioActivo tiene valor', async () => {
    mockIsLoading = false;
    mockPredioActivo = mockPredio;

    const { usePredioRequerido } = await import('@/shared/hooks/use-predio-requerido');
    renderHook(() => usePredioRequerido());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('debe retornar { predioActivo, isLoading } con los valores del store', async () => {
    mockIsLoading = false;
    mockPredioActivo = mockPredio;

    const { usePredioRequerido } = await import('@/shared/hooks/use-predio-requerido');
    const { result } = renderHook(() => usePredioRequerido());

    expect(result.current.predioActivo).toEqual(mockPredio);
    expect(result.current.isLoading).toBe(false);
  });
});
