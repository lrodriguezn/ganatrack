// apps/web/src/store/theme.store.ts
/**
 * Theme store — Zustand store for dark/light theme management.
 *
 * State:
 * - isDark: boolean — whether dark mode is active
 *
 * Actions:
 * - toggle(): invert current theme
 * - setDark(value: boolean): explicitly set theme
 *
 * Persistence:
 * - Manual localStorage sync with key 'darkMode' (values: 'true'/'false')
 * - Matches FOUC prevention script in layout.tsx
 * - System preference fallback via matchMedia('(prefers-color-scheme: dark)')
 * - Listens for OS preference changes when no manual preference exists
 */

'use client';

import { create } from 'zustand';

const STORAGE_KEY = 'darkMode';

// ============================================================================
// Helpers
// ============================================================================

/**
 * Read stored preference from localStorage.
 * Returns 'true' | 'false' | null
 */
function readStoredPreference(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Check if the OS prefers dark mode.
 */
function prefersDark(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

/**
 * Sync theme to localStorage and DOM class.
 */
function syncTheme(isDark: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, isDark ? 'true' : 'false');
  } catch {
    // localStorage unavailable — skip silently
  }
  document.documentElement.classList.toggle('dark', isDark);
}

/**
 * Compute initial theme value.
 * Priority: localStorage > matchMedia > light (default)
 */
function getInitialTheme(): boolean {
  const stored = readStoredPreference();
  if (stored !== null) {
    return stored === 'true';
  }
  return prefersDark();
}

// ============================================================================
// Types
// ============================================================================

interface ThemeState {
  isDark: boolean;
}

interface ThemeActions {
  toggle: () => void;
  setDark: (value: boolean) => void;
}

type ThemeStore = ThemeState & ThemeActions;

// ============================================================================
// Store
// ============================================================================

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: getInitialTheme(),

  toggle: () => {
    const next = !useThemeStore.getState().isDark;
    syncTheme(next);
    set({ isDark: next });
  },

  setDark: (value: boolean) => {
    if (value === useThemeStore.getState().isDark) return;
    syncTheme(value);
    set({ isDark: value });
  },
}));

// ============================================================================
// System preference listener
// ============================================================================

/**
 * Listen for OS preference changes.
 * Only applies when the user has NOT set a manual preference (no localStorage).
 */
if (typeof window !== 'undefined') {
  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', (e) => {
      // Only auto-update if no manual preference exists
      if (readStoredPreference() === null) {
        useThemeStore.getState().setDark(e.matches);
      }
    });
  } catch {
    // matchMedia unsupported — skip silently
  }
}
