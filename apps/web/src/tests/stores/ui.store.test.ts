// apps/web/src/tests/stores/ui.store.test.ts
/**
 * Tests for ui.store.ts
 * Coverage targets: addToast, removeToast, clearToasts, initial state
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useUiStore, selectToasts } from '@/store/ui.store';
import type { ToastInput } from '@/store/ui.store';

// ============================================================================
// Reset store before each test
// ============================================================================

beforeEach(() => {
  act(() => {
    useUiStore.getState().clearToasts();
  });
});

// ============================================================================
// Tests: Estado inicial
// ============================================================================

describe('ui.store — estado inicial', () => {
  it('debería tener toasts vacío en el estado inicial', () => {
    expect(useUiStore.getState().toasts).toEqual([]);
  });
});

// ============================================================================
// Tests: addToast
// ============================================================================

describe('ui.store — addToast', () => {
  it('debería agregar un toast a la cola', () => {
    const input: ToastInput = {
      message: 'Operación exitosa',
      type: 'success',
    };

    act(() => {
      useUiStore.getState().addToast(input);
    });

    expect(useUiStore.getState().toasts).toHaveLength(1);
  });

  it('debería crear un toast con la estructura correcta', () => {
    act(() => {
      useUiStore.getState().addToast({
        message: 'Error al guardar',
        type: 'error',
      });
    });

    const toast = useUiStore.getState().toasts[0];
    expect(toast).toMatchObject({
      message: 'Error al guardar',
      type: 'error',
      duration: 5000,
    });
    expect(typeof toast.id).toBe('number');
  });

  it('debería asignar duration por defecto de 5000ms cuando no se especifica', () => {
    act(() => {
      useUiStore.getState().addToast({ message: 'Mensaje', type: 'info' });
    });

    expect(useUiStore.getState().toasts[0].duration).toBe(5000);
  });

  it('debería respetar duration personalizada cuando se especifica', () => {
    act(() => {
      useUiStore.getState().addToast({ message: 'Mensaje', type: 'warning', duration: 3000 });
    });

    expect(useUiStore.getState().toasts[0].duration).toBe(3000);
  });

  it('debería agregar múltiples toasts en orden FIFO', () => {
    act(() => {
      useUiStore.getState().addToast({ message: 'Primero', type: 'success' });
      useUiStore.getState().addToast({ message: 'Segundo', type: 'error' });
      useUiStore.getState().addToast({ message: 'Tercero', type: 'info' });
    });

    const toasts = useUiStore.getState().toasts;
    expect(toasts).toHaveLength(3);
    expect(toasts[0].message).toBe('Primero');
    expect(toasts[1].message).toBe('Segundo');
    expect(toasts[2].message).toBe('Tercero');
  });

  it('debería asignar IDs únicos a cada toast', () => {
    act(() => {
      useUiStore.getState().addToast({ message: 'Toast 1', type: 'success' });
      useUiStore.getState().addToast({ message: 'Toast 2', type: 'success' });
      useUiStore.getState().addToast({ message: 'Toast 3', type: 'success' });
    });

    const toasts = useUiStore.getState().toasts;
    const ids = toasts.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3);
  });

  it('debería soportar todos los tipos de toast', () => {
    const types: ToastInput['type'][] = ['success', 'error', 'warning', 'info'];

    act(() => {
      types.forEach((type) => {
        useUiStore.getState().addToast({ message: `Toast ${type}`, type });
      });
    });

    const toasts = useUiStore.getState().toasts;
    expect(toasts).toHaveLength(4);
    types.forEach((type, index) => {
      expect(toasts[index].type).toBe(type);
    });
  });
});

// ============================================================================
// Tests: removeToast
// ============================================================================

describe('ui.store — removeToast', () => {
  it('debería eliminar un toast por id', () => {
    act(() => {
      useUiStore.getState().addToast({ message: 'Toast 1', type: 'success' });
      useUiStore.getState().addToast({ message: 'Toast 2', type: 'error' });
    });

    const toasts = useUiStore.getState().toasts;
    const idToRemove = toasts[0].id;

    act(() => {
      useUiStore.getState().removeToast(idToRemove);
    });

    const remaining = useUiStore.getState().toasts;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].message).toBe('Toast 2');
  });

  it('no debería modificar la cola si el id no existe', () => {
    act(() => {
      useUiStore.getState().addToast({ message: 'Toast', type: 'info' });
    });

    act(() => {
      useUiStore.getState().removeToast(9999);
    });

    expect(useUiStore.getState().toasts).toHaveLength(1);
  });

  it('debería resultar en cola vacía al eliminar el único toast', () => {
    act(() => {
      useUiStore.getState().addToast({ message: 'Único toast', type: 'success' });
    });

    const id = useUiStore.getState().toasts[0].id;

    act(() => {
      useUiStore.getState().removeToast(id);
    });

    expect(useUiStore.getState().toasts).toEqual([]);
  });

  it('debería mantener los otros toasts al eliminar uno del medio', () => {
    act(() => {
      useUiStore.getState().addToast({ message: 'Primero', type: 'success' });
      useUiStore.getState().addToast({ message: 'Segundo', type: 'error' });
      useUiStore.getState().addToast({ message: 'Tercero', type: 'info' });
    });

    const toasts = useUiStore.getState().toasts;
    const middleId = toasts[1].id;

    act(() => {
      useUiStore.getState().removeToast(middleId);
    });

    const remaining = useUiStore.getState().toasts;
    expect(remaining).toHaveLength(2);
    expect(remaining[0].message).toBe('Primero');
    expect(remaining[1].message).toBe('Tercero');
  });
});

// ============================================================================
// Tests: clearToasts
// ============================================================================

describe('ui.store — clearToasts', () => {
  it('debería eliminar todos los toasts de la cola', () => {
    act(() => {
      useUiStore.getState().addToast({ message: 'Toast 1', type: 'success' });
      useUiStore.getState().addToast({ message: 'Toast 2', type: 'error' });
      useUiStore.getState().addToast({ message: 'Toast 3', type: 'warning' });
      useUiStore.getState().clearToasts();
    });

    expect(useUiStore.getState().toasts).toEqual([]);
  });
});

// ============================================================================
// Tests: Selectores
// ============================================================================

describe('ui.store — selectores', () => {
  it('selectToasts debería retornar el array de toasts', () => {
    act(() => {
      useUiStore.getState().addToast({ message: 'Mensaje', type: 'success' });
    });

    const state = useUiStore.getState();
    const toasts = selectToasts(state);
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Mensaje');
  });
});
