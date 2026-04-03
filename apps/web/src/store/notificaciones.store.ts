// apps/web/src/store/notificaciones.store.ts
/**
 * Notificaciones store — manages notification UI state.
 *
 * State shape:
 * - panelOpen: boolean (slide-over panel visibility)
 * - unreadCount: number (unread notification count for badge)
 *
 * Actions:
 * - openPanel() / closePanel() — toggle panel visibility
 * - setUnreadCount(count) — set absolute count
 * - incrementUnread() / decrementUnread() — relative adjustments
 */

import { create } from 'zustand';

interface NotificacionesState {
  panelOpen: boolean;
  unreadCount: number;
}

interface NotificacionesActions {
  openPanel(): void;
  closePanel(): void;
  setUnreadCount(count: number): void;
  incrementUnread(): void;
  decrementUnread(): void;
}

type NotificacionesStore = NotificacionesState & NotificacionesActions;

// Initial state
const initialState: NotificacionesState = {
  panelOpen: false,
  unreadCount: 0,
};

export const useNotificacionesStore = create<NotificacionesStore>((set, get) => ({
  ...initialState,

  openPanel: () => {
    set({ panelOpen: true });
  },

  closePanel: () => {
    set({ panelOpen: false });
  },

  setUnreadCount: (count) => {
    set({ unreadCount: Math.max(0, count) });
  },

  incrementUnread: () => {
    set((state) => ({ unreadCount: state.unreadCount + 1 }));
  },

  decrementUnread: () => {
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) }));
  },
}));

// ============================================================================
// Selectors
// ============================================================================

export const selectPanelOpen = (state: NotificacionesStore): boolean =>
  state.panelOpen;

export const selectUnreadCount = (state: NotificacionesStore): number =>
  state.unreadCount;
