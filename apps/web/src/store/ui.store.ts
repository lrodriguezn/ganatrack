// apps/web/src/store/ui.store.ts
/**
 * UI store — manages global UI state.
 *
 * State shape:
 * - toasts: Toast[] — queue of notifications to display
 *
 * Each toast has:
 * - id: number (auto-incremented)
 * - message: string
 * - type: 'success' | 'error' | 'warning' | 'info'
 * - duration: number (ms, default 5000)
 */

import { create } from 'zustand';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

export type ToastInput = Pick<Toast, 'message' | 'type'> & { duration?: number };

interface UiState {
  toasts: Toast[];
}

interface UiActions {
  addToast(input: ToastInput): void;
  removeToast(id: number): void;
  clearToasts(): void;
}

type UiStore = UiState & UiActions;

// Auto-incremented ID counter
let toastIdCounter = 0;

const DEFAULT_DURATION = 5000;

const initialState: UiState = {
  toasts: [],
};

export const useUiStore = create<UiStore>((set) => ({
  ...initialState,

  /**
   * Add a toast to the queue.
   * Duration defaults to 5000ms if not specified.
   */
  addToast: (input) => {
    const toast: Toast = {
      id: ++toastIdCounter,
      message: input.message,
      type: input.type,
      duration: input.duration ?? DEFAULT_DURATION,
    };
    set((state) => ({
      toasts: [...state.toasts, toast],
    }));
  },

  /**
   * Remove a toast by ID.
   */
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  /**
   * Clear all toasts.
   */
  clearToasts: () => {
    set({ toasts: [] });
  },
}));

// ============================================================================
// Selectors
// ============================================================================

export const selectToasts = (state: UiStore): Toast[] => state.toasts;
