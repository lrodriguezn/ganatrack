// apps/web/src/tests/stores/predio.store.test.ts
/**
 * Tests for predio.store.ts
 * Coverage targets: setPredios, addPredio, updatePredio, removePredio,
 *                   switchPredio, clearPredios, initial state, selectors
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import {
  usePredioStore,
  selectPredios,
  selectPredioActivo,
  selectIsLoading,
  selectLastSwitchTimestamp,
} from '@/store/predio.store';
import type { Predio } from '@ganatrack/shared-types';

// ============================================================================
// Fixtures
// ============================================================================

const mockPredio1: Predio = {
  id: 1,
  nombre: 'Finca La Esperanza',
  departamento: 'Cundinamarca',
  municipio: 'Guatavita',
  hectares: 120,
  tipo: 'cría',
  estado: 'activo',
};

const mockPredio2: Predio = {
  id: 2,
  nombre: 'Hacienda San Pedro',
  departamento: 'Boyacá',
  municipio: 'Duitama',
  hectares: 85,
  tipo: 'lechería',
  estado: 'activo',
};

const mockPredio3: Predio = {
  id: 3,
  nombre: 'El Retiro',
  departamento: 'Antioquia',
  municipio: 'Rionegro',
  hectares: 200,
  tipo: 'engorde',
  estado: 'activo',
};

// ============================================================================
// Reset store before each test
// ============================================================================

beforeEach(() => {
  sessionStorage.clear();
  act(() => {
    usePredioStore.getState().clearPredios();
  });
});

// ============================================================================
// Tests: Estado inicial
// ============================================================================

describe('predio.store — estado inicial', () => {
  it('debería tener predios vacío en el estado inicial', () => {
    expect(usePredioStore.getState().predios).toEqual([]);
  });

  it('debería tener predioActivo null en el estado inicial', () => {
    expect(usePredioStore.getState().predioActivo).toBeNull();
  });

  it('debería tener isLoading false en el estado inicial', () => {
    expect(usePredioStore.getState().isLoading).toBe(false);
  });

  it('debería tener lastSwitchTimestamp null en el estado inicial', () => {
    expect(usePredioStore.getState().lastSwitchTimestamp).toBeNull();
  });
});

// ============================================================================
// Tests: setPredios
// ============================================================================

describe('predio.store — setPredios', () => {
  it('debería establecer la lista de predios', () => {
    act(() => {
      usePredioStore.getState().setPredios([mockPredio1, mockPredio2]);
    });

    expect(usePredioStore.getState().predios).toHaveLength(2);
    expect(usePredioStore.getState().predios[0]).toEqual(mockPredio1);
  });

  it('debería establecer isLoading en false al llamar setPredios', () => {
    act(() => {
      usePredioStore.setState({ isLoading: true });
      usePredioStore.getState().setPredios([mockPredio1]);
    });

    expect(usePredioStore.getState().isLoading).toBe(false);
  });

  it('debería mantener predioActivo si sigue en la nueva lista', () => {
    act(() => {
      usePredioStore.getState().setPredios([mockPredio1, mockPredio2]);
      usePredioStore.getState().switchPredio(1);
      // Update list keeping predio 1
      usePredioStore.getState().setPredios([mockPredio1, mockPredio3]);
    });

    expect(usePredioStore.getState().predioActivo).toEqual(mockPredio1);
  });

  it('debería limpiar predioActivo si ya no está en la nueva lista', () => {
    act(() => {
      usePredioStore.getState().setPredios([mockPredio1, mockPredio2]);
      usePredioStore.getState().switchPredio(2);
      // Update list removing predio 2
      usePredioStore.getState().setPredios([mockPredio1, mockPredio3]);
    });

    expect(usePredioStore.getState().predioActivo).toBeNull();
  });

  it('debería reemplazar toda la lista al llamar setPredios', () => {
    act(() => {
      usePredioStore.getState().setPredios([mockPredio1, mockPredio2, mockPredio3]);
      usePredioStore.getState().setPredios([mockPredio1]);
    });

    expect(usePredioStore.getState().predios).toHaveLength(1);
  });
});

// ============================================================================
// Tests: addPredio
// ============================================================================

describe('predio.store — addPredio', () => {
  it('debería agregar un predio al final de la lista', () => {
    act(() => {
      usePredioStore.getState().setPredios([mockPredio1]);
      usePredioStore.getState().addPredio(mockPredio2);
    });

    const predios = usePredioStore.getState().predios;
    expect(predios).toHaveLength(2);
    expect(predios[1]).toEqual(mockPredio2);
  });

  it('debería agregar a lista vacía', () => {
    act(() => {
      usePredioStore.getState().addPredio(mockPredio1);
    });

    expect(usePredioStore.getState().predios).toHaveLength(1);
  });
});

// ============================================================================
// Tests: updatePredio
// ============================================================================

describe('predio.store — updatePredio', () => {
  it('debería actualizar un predio existente por id', () => {
    act(() => {
      usePredioStore.getState().setPredios([mockPredio1, mockPredio2]);
      usePredioStore.getState().updatePredio({ ...mockPredio1, nombre: 'Finca Actualizada' });
    });

    const predios = usePredioStore.getState().predios;
    expect(predios[0].nombre).toBe('Finca Actualizada');
  });

  it('debería actualizar predioActivo si el predio actualizado es el activo', () => {
    act(() => {
      usePredioStore.getState().setPredios([mockPredio1, mockPredio2]);
      usePredioStore.getState().switchPredio(1);
      usePredioStore.getState().updatePredio({ ...mockPredio1, nombre: 'Nombre Nuevo' });
    });

    expect(usePredioStore.getState().predioActivo?.nombre).toBe('Nombre Nuevo');
  });

  it('no debería cambiar predioActivo si se actualiza un predio diferente al activo', () => {
    act(() => {
      usePredioStore.getState().setPredios([mockPredio1, mockPredio2]);
      usePredioStore.getState().switchPredio(1);
      usePredioStore.getState().updatePredio({ ...mockPredio2, nombre: 'Predio 2 Actualizado' });
    });

    expect(usePredioStore.getState().predioActivo?.id).toBe(1);
    expect(usePredioStore.getState().predioActivo?.nombre).toBe('Finca La Esperanza');
  });
});

// ============================================================================
// Tests: removePredio
// ============================================================================

describe('predio.store — removePredio', () => {
  it('debería eliminar un predio por id', () => {
    act(() => {
      usePredioStore.getState().setPredios([mockPredio1, mockPredio2]);
      usePredioStore.getState().removePredio(1);
    });

    const predios = usePredioStore.getState().predios;
    expect(predios).toHaveLength(1);
    expect(predios[0].id).toBe(2);
  });

  it('debería cambiar predioActivo al primer predio restante si se elimina el activo', () => {
    act(() => {
      usePredioStore.getState().setPredios([mockPredio1, mockPredio2]);
      usePredioStore.getState().switchPredio(1);
      usePredioStore.getState().removePredio(1);
    });

    expect(usePredioStore.getState().predioActivo?.id).toBe(2);
  });

  it('debería limpiar predioActivo si era el único predio y se elimina', () => {
    act(() => {
      usePredioStore.getState().setPredios([mockPredio1]);
      usePredioStore.getState().switchPredio(1);
      usePredioStore.getState().removePredio(1);
    });

    expect(usePredioStore.getState().predioActivo).toBeNull();
  });
});

// ============================================================================
// Tests: switchPredio
// ============================================================================

describe('predio.store — switchPredio', () => {
  it('debería cambiar predioActivo al predio seleccionado', () => {
    act(() => {
      usePredioStore.getState().setPredios([mockPredio1, mockPredio2]);
      usePredioStore.getState().switchPredio(2);
    });

    expect(usePredioStore.getState().predioActivo).toEqual(mockPredio2);
  });

  it('debería actualizar lastSwitchTimestamp al cambiar de predio', () => {
    const before = Date.now();

    act(() => {
      usePredioStore.getState().setPredios([mockPredio1, mockPredio2]);
      usePredioStore.getState().switchPredio(1);
    });

    const timestamp = usePredioStore.getState().lastSwitchTimestamp;
    expect(timestamp).not.toBeNull();
    expect(timestamp!).toBeGreaterThanOrEqual(before);
  });

  it('no debería hacer nada si la lista de predios está vacía', () => {
    act(() => {
      usePredioStore.getState().switchPredio(1);
    });

    expect(usePredioStore.getState().predioActivo).toBeNull();
    expect(usePredioStore.getState().lastSwitchTimestamp).toBeNull();
  });

  it('no debería hacer nada si el id no existe en la lista', () => {
    act(() => {
      usePredioStore.getState().setPredios([mockPredio1]);
      usePredioStore.getState().switchPredio(999);
    });

    expect(usePredioStore.getState().predioActivo).toBeNull();
  });
});

// ============================================================================
// Tests: clearPredios
// ============================================================================

describe('predio.store — clearPredios', () => {
  it('debería limpiar todo el estado al llamar clearPredios', () => {
    act(() => {
      usePredioStore.getState().setPredios([mockPredio1, mockPredio2]);
      usePredioStore.getState().switchPredio(1);
      usePredioStore.getState().clearPredios();
    });

    const state = usePredioStore.getState();
    expect(state.predios).toEqual([]);
    expect(state.predioActivo).toBeNull();
    expect(state.lastSwitchTimestamp).toBeNull();
  });
});

// ============================================================================
// Tests: Selectores
// ============================================================================

describe('predio.store — selectores', () => {
  it('selectPredios debería retornar la lista de predios', () => {
    act(() => {
      usePredioStore.getState().setPredios([mockPredio1, mockPredio2]);
    });

    const state = usePredioStore.getState();
    expect(selectPredios(state)).toHaveLength(2);
  });

  it('selectPredioActivo debería retornar el predio activo', () => {
    act(() => {
      usePredioStore.getState().setPredios([mockPredio1]);
      usePredioStore.getState().switchPredio(1);
    });

    const state = usePredioStore.getState();
    expect(selectPredioActivo(state)).toEqual(mockPredio1);
  });

  it('selectIsLoading debería retornar el estado de carga', () => {
    const state = usePredioStore.getState();
    expect(selectIsLoading(state)).toBe(false);
  });

  it('selectLastSwitchTimestamp debería retornar null inicialmente', () => {
    const state = usePredioStore.getState();
    expect(selectLastSwitchTimestamp(state)).toBeNull();
  });
});
