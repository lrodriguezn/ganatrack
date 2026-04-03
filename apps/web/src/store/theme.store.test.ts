// apps/web/src/store/theme.store.test.ts
/**
 * Tests for theme.store.ts
 *
 * Coverage targets:
 * - toggle() inverts isDark
 * - setDark() sets correct value with no-op guard
 * - localStorage writes key 'darkMode' with 'true'/'false'
 * - document.documentElement.classList toggles 'dark'
 * - Store initialization from localStorage, matchMedia, and default
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ============================================================================
// Mocks
// ============================================================================

const mockLocalStorage: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => mockLocalStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(mockLocalStorage).forEach((k) => delete mockLocalStorage[k]);
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// ============================================================================
// Helper: reset store module between tests
// ============================================================================

async function resetThemeStore() {
  // Clear module cache to force re-initialization
  vi.resetModules();
  // Clear mock data object (NOT mockLocalStorage.clear — that's the raw object without clear method)
  Object.keys(mockLocalStorage).forEach((k) => delete mockLocalStorage[k]);
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();

  // Reset document classList
  document.documentElement.classList.remove('dark');

  // Re-import store fresh
  const { useThemeStore } = await import('./theme.store');
  return useThemeStore;
}

// ============================================================================
// Tests: toggle()
// ============================================================================

describe('theme.store — toggle()', () => {
  it('debería invertir isDark de false a true', async () => {
    const useThemeStore = await resetThemeStore();

    expect(useThemeStore.getState().isDark).toBe(false);

    useThemeStore.getState().toggle();

    expect(useThemeStore.getState().isDark).toBe(true);
  });

  it('debería invertir isDark de true a false', async () => {
    mockLocalStorage['darkMode'] = 'true';
    const useThemeStore = await resetThemeStore();

    expect(useThemeStore.getState().isDark).toBe(true);

    useThemeStore.getState().toggle();

    expect(useThemeStore.getState().isDark).toBe(false);
  });

  it('debería escribir localStorage con key "darkMode" y valor "true"', async () => {
    const useThemeStore = await resetThemeStore();

    useThemeStore.getState().toggle();

    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', 'true');
  });

  it('debería escribir localStorage con key "darkMode" y valor "false"', async () => {
    mockLocalStorage['darkMode'] = 'true';
    const useThemeStore = await resetThemeStore();

    useThemeStore.getState().toggle();

    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', 'false');
  });

  it('debería agregar clase "dark" al documentElement al activar dark', async () => {
    const useThemeStore = await resetThemeStore();

    useThemeStore.getState().toggle();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('debería remover clase "dark" del documentElement al desactivar dark', async () => {
    mockLocalStorage['darkMode'] = 'true';
    const useThemeStore = await resetThemeStore();

    useThemeStore.getState().toggle();

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});

// ============================================================================
// Tests: setDark()
// ============================================================================

describe('theme.store — setDark()', () => {
  it('debería setear isDark en true', async () => {
    const useThemeStore = await resetThemeStore();

    useThemeStore.getState().setDark(true);

    expect(useThemeStore.getState().isDark).toBe(true);
  });

  it('debería setear isDark en false', async () => {
    mockLocalStorage['darkMode'] = 'true';
    const useThemeStore = await resetThemeStore();

    useThemeStore.getState().setDark(false);

    expect(useThemeStore.getState().isDark).toBe(false);
  });

  it('debería escribir localStorage con el valor correcto', async () => {
    const useThemeStore = await resetThemeStore();

    useThemeStore.getState().setDark(true);

    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', 'true');
  });

  it('debería agregar/quitar clase "dark" correctamente', async () => {
    const useThemeStore = await resetThemeStore();

    useThemeStore.getState().setDark(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    useThemeStore.getState().setDark(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('debería no hacer nada si el valor ya es el mismo', async () => {
    const useThemeStore = await resetThemeStore();
    const callsBefore = localStorageMock.setItem.mock.calls.length;

    // Default isDark=false, setting to false should be no-op
    useThemeStore.getState().setDark(false);

    expect(localStorageMock.setItem).toHaveBeenCalledTimes(callsBefore);
    expect(useThemeStore.getState().isDark).toBe(false);
  });
});

// ============================================================================
// Tests: Store initialization
// ============================================================================

describe('theme.store — inicialización', () => {
  it('debería inicializar isDark=true cuando localStorage tiene "true"', async () => {
    mockLocalStorage['darkMode'] = 'true';
    const useThemeStore = await resetThemeStore();

    expect(useThemeStore.getState().isDark).toBe(true);
  });

  it('debería inicializar isDark=false cuando localStorage tiene "false"', async () => {
    mockLocalStorage['darkMode'] = 'false';
    const useThemeStore = await resetThemeStore();

    expect(useThemeStore.getState().isDark).toBe(false);
  });

  it('debería inicializar isDark=false cuando localStorage es null (jsdom default matchMedia=false)', async () => {
    // In jsdom, matchMedia('(prefers-color-scheme: dark)').matches is false by default
    // So with no localStorage preference, it falls back to matchMedia which returns false
    const useThemeStore = await resetThemeStore();

    expect(useThemeStore.getState().isDark).toBe(false);
  });
});
