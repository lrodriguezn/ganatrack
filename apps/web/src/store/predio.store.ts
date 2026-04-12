// apps/web/src/store/predio.store.ts
/**
 * Predio store — manages multi-predio state and active selection.
 *
 * State shape:
 * - predios: Predio[] (list of predios accessible to user)
 * - predioActivo: Predio | null (currently selected predio)
 * - isLoading: boolean
 * - lastSwitchTimestamp: number | null (Unix ms — signal for cache invalidation)
 *
 * IMPORTANT: lastSwitchTimestamp is the external signal hook for
 * TanStack Query cache invalidation. When switchPredio() is called,
 * this timestamp updates. Components subscribe to this value to
 * trigger cache invalidation.
 */

import { create } from 'zustand';
import type { Predio } from '@ganatrack/shared-types';

interface PredioState {
  predios: Predio[];
  predioActivo: Predio | null;
  isLoading: boolean;
  lastSwitchTimestamp: number | null;
}

interface PredioActions {
  setPredios(predios: Predio[]): void;
  addPredio(predio: Predio): void;
  updatePredio(predio: Predio): void;
  removePredio(id: number): void;
  switchPredio(id: number): void;
  clearPredios(): void;
}

type PredioStore = PredioState & PredioActions;

// Initial state
const initialState: PredioState = {
  predios: [],
  predioActivo: null,
  isLoading: true,
  lastSwitchTimestamp: null,
};

export const usePredioStore = create<PredioStore>((set, get) => ({
  ...initialState,

  setPredios: (predios) => {
    // Restore saved predio ID from sessionStorage
    let savedPredioId: number | null = null;
    try {
      const stored = sessionStorage.getItem('ganatrack-predio-activo-id');
      savedPredioId = stored ? Number(stored) : null;
    } catch { /* ignore */ }

    // Determine active predio: saved ID if in list, otherwise current if still in list, otherwise null
    const hasSaved = savedPredioId && predsContains(predios, savedPredioId);
    const newActivo = hasSaved
      ? predios.find((p) => p.id === savedPredioId) ?? null
      : predsContains(predios, get().predioActivo?.id)
        ? get().predioActivo
        : null;

    set({
      predios,
      isLoading: false,
      predioActivo: newActivo,
    });
  },

  /**
   * Add a single Predio to the array.
   * Used for granular sync after CRUD operations.
   */
  addPredio: (predio) => {
    set((state) => ({
      predios: [...state.predios, predio],
    }));
  },

  /**
   * Update an existing Predio in the array by id.
   * Also updates activo if it was the active one.
   */
  updatePredio: (predio) => {
    set((state) => ({
      predios: state.predios.map((p) => (p.id === predio.id ? predio : p)),
      predioActivo:
        state.predioActivo?.id === predio.id ? predio : state.predioActivo,
    }));
  },

  /**
   * Remove a Predio from the array by id.
   * If the removed Predio was activo, switches to another or clears.
   */
  removePredio: (id) => {
    set((state) => {
      const newPredios = state.predios.filter((p) => p.id !== id);
      let newActivo = state.predioActivo;
      if (state.predioActivo?.id === id) {
        newActivo = newPredios[0] ?? null;
      }
      return { predios: newPredios, predioActivo: newActivo };
    });
  },

  /**
   * Switch active predio by ID.
   * Updates lastSwitchTimestamp for cache invalidation signaling.
   * No-op if predios array is empty (guard clause).
   */
  switchPredio: (id) => {
    const { predios } = get();

    // Guard: no-op if predios array is empty
    if (predios.length === 0) {
      return;
    }

    const found = predios.find((p) => p.id === id);
    if (!found) {
      return;
    }

    // Persist active predio ID to sessionStorage for rehydration on refresh
    try {
      sessionStorage.setItem('ganatrack-predio-activo-id', String(id));
    } catch { /* ignore — sessionStorage may be unavailable */ }

    set({
      predioActivo: found,
      lastSwitchTimestamp: Date.now(),
    });
  },

  clearPredios: () => {
    set(initialState);
  },
}));

// ============================================================================
// Helpers
// ============================================================================

function predsContains(predios: Predio[], id: number | undefined): boolean {
  if (!id) return false;
  return predios.some((p) => p.id === id);
}

// ============================================================================
// Selectors
// ============================================================================

export const selectPredios = (state: PredioStore): Predio[] => state.predios;

export const selectPredioActivo = (state: PredioStore): Predio | null =>
  state.predioActivo;

export const selectIsLoading = (state: PredioStore): boolean => state.isLoading;

export const selectLastSwitchTimestamp = (
  state: PredioStore,
): number | null => state.lastSwitchTimestamp;
