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
  switchPredio(id: string): void;
  clearPredios(): void;
}

type PredioStore = PredioState & PredioActions;

// Initial state
const initialState: PredioState = {
  predios: [],
  predioActivo: null,
  isLoading: false,
  lastSwitchTimestamp: null,
};

export const usePredioStore = create<PredioStore>((set, get) => ({
  ...initialState,

  setPredios: (predios) => {
    set({
      predios,
      isLoading: false,
      // Clear active if it's not in the new list
      predioActivo: predsContains(predios, get().predioActivo?.id)
        ? get().predioActivo
        : null,
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

function predsContains(predios: Predio[], id: string | undefined): boolean {
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
