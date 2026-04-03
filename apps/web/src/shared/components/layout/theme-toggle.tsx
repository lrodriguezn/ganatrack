// apps/web/src/shared/components/layout/theme-toggle.tsx
/**
 * ThemeToggle — sun/moon toggle button for dark mode.
 *
 * Features:
 * - SunIcon shows when in dark mode (click to switch to light)
 * - MoonIcon shows when in light mode (click to switch to dark)
 * - Reads isDark and toggle from themeStore
 * - Accessible: aria-label changes based on current theme
 * - Keyboard focusable with visible focus ring in both themes
 *
 * Icons from lucide-react.
 */

'use client';

import { SunIcon, MoonIcon } from 'lucide-react';
import { useThemeStore } from '@/store/theme.store';

export function ThemeToggle(): JSX.Element {
  const isDark = useThemeStore((s) => s.isDark);
  const toggle = useThemeStore((s) => s.toggle);

  return (
    <button
      type="button"
      className="flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      onClick={toggle}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? (
        <SunIcon className="h-5 w-5" aria-hidden="true" />
      ) : (
        <MoonIcon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
