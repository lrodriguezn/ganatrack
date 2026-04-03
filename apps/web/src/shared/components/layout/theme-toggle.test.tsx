// apps/web/src/shared/components/layout/theme-toggle.test.tsx
/**
 * Tests for ThemeToggle component.
 *
 * Coverage targets:
 * - Renders MoonIcon when in light mode
 * - Renders SunIcon when in dark mode
 * - Clicking toggles theme
 * - aria-label changes based on current theme
 * - Button is keyboard focusable
 *
 * NOTE: These tests require the MSW handler issue to be fixed first.
 * The missing `animales.handlers.ts` in src/tests/mocks/handlers/
 * causes the entire vitest setup to fail.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock localStorage
const mockLocalStorage: Record<string, string> = {};
Object.defineProperty(window, 'localStorage', {
  value: {
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
  },
  writable: true,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn(() => ({
    matches: false,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
  writable: true,
});

async function renderThemeToggle() {
  // Reset module cache to get fresh store
  vi.resetModules();
  document.documentElement.classList.remove('dark');

  const { ThemeToggle } = await import('./theme-toggle');
  return render(<ThemeToggle />);
}

describe('ThemeToggle — renderizado', () => {
  beforeEach(() => {
    Object.keys(mockLocalStorage).forEach((k) => delete mockLocalStorage[k]);
    vi.clearAllMocks();
  });

  it('debería renderizar el botón con MoonIcon en modo claro', async () => {
    await renderThemeToggle();

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Cambiar a modo oscuro');
  });

  it('debería renderizar el botón con SunIcon en modo oscuro', async () => {
    mockLocalStorage.setItem('darkMode', 'true');
    await renderThemeToggle();

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Cambiar a modo claro');
  });
});

describe('ThemeToggle — interacción', () => {
  beforeEach(() => {
    Object.keys(mockLocalStorage).forEach((k) => delete mockLocalStorage[k]);
    vi.clearAllMocks();
  });

  it('debería cambiar el aria-label al hacer click', async () => {
    const user = userEvent.setup();
    await renderThemeToggle();

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Cambiar a modo oscuro');

    await user.click(button);

    expect(button).toHaveAttribute('aria-label', 'Cambiar a modo claro');
  });

  it('debería ser activable con teclado', async () => {
    const user = userEvent.setup();
    await renderThemeToggle();

    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(button).toHaveAttribute('aria-label', 'Cambiar a modo claro');
  });
});
