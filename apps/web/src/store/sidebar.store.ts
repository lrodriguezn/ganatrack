// apps/web/src/store/sidebar.store.ts
/**
 * Sidebar store — Zustand store for sidebar state management.
 *
 * State:
 * - isCollapsed: boolean — collapsed mode (tablet icons-only or desktop collapsed)
 *   NOTE: persisted to localStorage
 * - isMobileOpen: boolean — mobile overlay visibility (ephemeral, NOT persisted)
 *
 * The store is used by:
 * - admin-sidebar.tsx: reads isCollapsed for desktop/tablet rendering
 * - mobile-sidebar.tsx: reads isMobileOpen for overlay visibility
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
}

interface SidebarActions {
  toggleCollapsed: () => void;
  setCollapsed: (value: boolean) => void;
  toggleMobile: () => void;
  setMobileOpen: (value: boolean) => void;
}

type SidebarStore = SidebarState & SidebarActions;

const initialState: SidebarState = {
  isCollapsed: false,
  isMobileOpen: false,
};

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      ...initialState,

      toggleCollapsed: () => {
        set((state) => ({ isCollapsed: !state.isCollapsed }));
      },

      setCollapsed: (value: boolean) => {
        set({ isCollapsed: value });
      },

      toggleMobile: () => {
        set((state) => ({ isMobileOpen: !state.isMobileOpen }));
      },

      setMobileOpen: (value: boolean) => {
        set({ isMobileOpen: value });
      },
    }),
    {
      name: 'ganatrack-sidebar',
      // Only persist isCollapsed — mobile state is ephemeral
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    },
  ),
);
