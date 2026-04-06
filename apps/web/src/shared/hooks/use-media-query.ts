// apps/web/src/shared/hooks/use-media-query.ts
/**
 * useMediaQuery — Reactive CSS media query matching.
 *
 * Returns true/false based on whether the given media query matches.
 * Handles SSR safely (returns false on server, hydrates on client).
 * Listens for changes (orientation, resize) and updates reactively.
 *
 * @param query - CSS media query string (e.g., '(min-width: 768px)')
 * @returns boolean — true if the media query matches
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 639px)');
 * const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 */
'use client';

import { useEffect, useState } from 'react';

function safeQuery(query: string): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(query).matches;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => safeQuery(query));

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// ============================================================================
// Preset breakpoint hooks (GanaTrack standard breakpoints)
// ============================================================================

/** max-width: 639px — mobile phones */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 639px)');
}

/** min-width: 640px AND max-width: 1023px — tablets */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
}

/** min-width: 1024px — desktop */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
